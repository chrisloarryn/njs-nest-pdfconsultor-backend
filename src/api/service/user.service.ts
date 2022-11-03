import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { catchError, map, Observable, retry, switchMap, throwIfEmpty } from 'rxjs';
import { DeleteResult, TypeORMError } from 'typeorm';

import { UserDTO } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository';

@Injectable()
export class UserService {
	constructor(private repo: UserRepository) {}

	getUsers(): Observable<User[]> {
		return this.repo.getUsers().pipe(
			retry(3),
			throwIfEmpty(() => new NotFoundException('No users found')),
			catchError((err) => {
				throw new InternalServerErrorException(err);
			}),
			map((users) => users),
		);
	}

	getUserById(id: number): Observable<User> {
		return this.repo.getUserById(id).pipe(
			retry(3),
			throwIfEmpty(() => new NotFoundException('User not found')),
			catchError((err) => {
				throw new InternalServerErrorException(err);
			}),
			map((user) => user),
		);
	}

	createUser(user: UserDTO): Observable<User> {
		const { usr_email, usr_last_name, usr_name } = user;
		const newUser = new User();
		newUser.setUserName(usr_name);
		newUser.setUserLastName(usr_last_name);
		newUser.setUserEmail(usr_email);
		return this.repo.createUser(newUser).pipe(
			retry(3),
			catchError((err) => {
				if (err instanceof TypeORMError) {
					err.message = (err as any).detail.includes('already exists') ? 'User already exists' : err.message;
					const status = (err as any).detail.includes('already exists') ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
					throw new HttpException(err, status);
				}
				if (err.status !== HttpStatus.INTERNAL_SERVER_ERROR) {
					throw err;
				}
				throw new InternalServerErrorException(err);
			}),
			map((user) => user),
		);
	}

	deleteUser(id: number): Observable<DeleteResult> {
		return this.getUserById(id).pipe(
			throwIfEmpty(() => new NotFoundException('User not found')),
			catchError((err) => {
				throw err;
			}),

			map((user) => user),
			switchMap((user) => this.repo.deleteUser(user.usr_id)),
		);
	}

	updateUser(id: number, user: UserDTO): Observable<User> {
		const { usr_email, usr_last_name, usr_name } = user;
		return this.repo.getUserById(id).pipe(
			throwIfEmpty(() => new NotFoundException('User not found')),
			map((user) => {
				user.usr_email = usr_email;
				user.usr_last_name = usr_last_name;
				user.usr_name = usr_name;
				this.repo.updateUser(id, user);
				return user;
			}),
			catchError((err) => {
				throw new InternalServerErrorException(err);
			}),
		);
	}
}
