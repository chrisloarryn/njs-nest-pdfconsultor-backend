import { Body, Controller, Delete, Get, Inject, Param, Put, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { Logger } from 'winston';

import { UserDTO } from '../dto/user.dto';
import { User } from '../entities';
import { UserService } from '../service';

@ApiTags('Users Postgresql')
@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService,
		@Inject(WINSTON_MODULE_PROVIDER)
		private readonly logger: Logger,
	) {}

	/**
	 * Function get all users.
	 * @author CLA Cartolas
	 * @param null
	 * @return {[User]} List of users.
	 */
	@ApiOperation({ description: 'Get all users' })
	@ApiCreatedResponse({
		description: 'List of Users.',
		type: Observable<User[]>,
	})
	@Get('')
	getUsers(): Observable<User[]> {
		this.logger.info(`method: getUsers, req:null`);
		const users = this.userService.getUsers();
		users
			.subscribe((users) => {
				this.logger.info(`response: ${JSON.stringify(users)}`);
			})
			.unsubscribe();
		return users;
	}

	/**
	 * Function get user by Id.
	 * @author CLA Cartolas
	 * @param id user id
	 * @return {User} user
	 */
	@ApiOperation({ description: 'Get User' })
	@ApiCreatedResponse({
		description: 'User.',
		type: User,
	})
	@ApiParam({ name: 'id' })
	@Get(':id')
	getUserById(@Param('id') id: number) {
		this.logger.info(`method: getById, req:${id}`);
		const user = this.userService.getUserById(id);
		user.subscribe((user) => {
			this.logger.info(`response:${JSON.stringify(user)}`);
		});
	}

	/**
	 * Function create new user.
	 * @author CLA Cartolas
	 * @param UserDTO  user to create
	 * @return {UserDTO} user created
	 */
	@ApiOperation({ description: 'Create a new User' })
	@ApiCreatedResponse({
		description: 'The user that was successfully created.',
		type: Observable<User>,
	})
	@Post('')
	createUser(@Body() newUser: UserDTO): Observable<User> {
		this.logger.info(`method: createUser, req:${newUser}`);
		const user = this.userService.createUser(newUser);
		user
			.subscribe((user) => {
				this.logger.info(`response: ${JSON.stringify(user)}`);
			})
			.unsubscribe();
		return user;
	}

	/**
	 * Function delete user by Id.
	 * @author CLA Cartolas
	 * @param id user id
	 * @return {User} user deleted
	 */
	@ApiOperation({ description: 'Delete User by Id' })
	@ApiParam({ name: 'id' })
	@ApiCreatedResponse({
		description: 'The user that was deleted.',
		type: User,
	})
	@Delete(':id')
	delete(@Param('id') id: number) {
		this.logger.info(`method: delete, req:${id}`);
		const user = this.userService.deleteUser(id);
		user
			.subscribe((user) => {
				this.logger.info(`response:${JSON.stringify(user)}`);
			})
			.unsubscribe();
		return user;
	}

	/**
	 * Function update user.
	 * @author CLA Cartolas
	 * @param {id, UserDTO} - id of user to be update and data in body
	 * @return {User} user updated
	 */
	@ApiOperation({ description: 'Update User by Id' })
	@ApiCreatedResponse({
		description: 'The user that was successfully update.',
		type: User,
	})
	@ApiParam({ name: 'id' })
	@Put(':id')
	updateUser(@Param('id') id: number, @Body() user: UserDTO): Observable<User> {
		this.logger.info(`method: updateUser, req:${id}`);
		const userUpdated = this.userService.updateUser(id, user);
		userUpdated
			.subscribe((user) => {
				this.logger.info(`response:${JSON.stringify(user)}`);
			})
			.unsubscribe();
		return userUpdated;
	}
}
