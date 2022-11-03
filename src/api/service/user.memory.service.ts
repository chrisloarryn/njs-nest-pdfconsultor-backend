import { InMemoryDBService } from '@nestjs-addons/in-memory-db';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { UserEntity } from '../interface/user.interface';

@Injectable()
export class UserMemoryService {
	constructor(
		private userRepository: InMemoryDBService<UserEntity>,
		@Inject(WINSTON_MODULE_PROVIDER)
		private readonly logger: Logger,
	) {}

	getAllUsers() {
		return this.userRepository.getAll();
	}

	async getById(id: number) {
		const result = this.userRepository.get(String(id));
		if (result) return result;
		else throw new NotFoundException('Error - No existen datos para el id ingresado');
	}

	createUser(user: UserEntity) {
		return this.userRepository.create(user);
	}

	async deleteUser(id: number) {
		const user = this.getById(id);
		this.userRepository.delete(String(id));
		return user;
	}

	async updateUser(id: number, user: UserEntity) {
		const { usr_name, usr_last_name, usr_email } = user;
		const userUpdate = await this.getById(id);
		userUpdate.usr_name = usr_name;
		userUpdate.usr_last_name = usr_last_name;
		userUpdate.usr_email = usr_email;
		this.userRepository.update(userUpdate);
		return userUpdate;
	}
}
