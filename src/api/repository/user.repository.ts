import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
	constructor(@InjectRepository(User) private repository: Repository<User>) {}

	// TODO: pagination
	public getUsers(): Observable<User[]> {
		return from(
			this.repository.find({
				order: { usr_id: 'ASC' },
				select: ['usr_id', 'usr_name', 'usr_last_name', 'usr_email', 'created_at', 'updated_at'],
			}),
		);
	}

	public getUserById(id: number): Observable<User> {
		return from(this.repository.findOneOrFail({ where: { usr_id: id } }));
	}

	public getUserByEmail(email: string): Observable<User> {
		return from(this.repository.findOneOrFail({ where: { usr_email: email } }));
	}

	public createUser(user: User): Observable<User> {
		return from(this.repository.save(user));
	}

	public updateUser(id: number, user: User): Observable<UpdateResult> {
		return from(this.repository.update(id, user));
	}

	public deleteUser(id: number): Observable<DeleteResult> {
		return from(this.repository.delete(id));
	}
}
