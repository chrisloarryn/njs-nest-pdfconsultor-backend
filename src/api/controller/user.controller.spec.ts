import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { from, map, Observable, switchMap, toArray } from 'rxjs';

import { UserDTO } from '../dto';
import { User } from '../entities';
import { UserRepository } from '../repository';
import { UserService } from '../service';

import { UserController } from '.';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const makeUser = (i: number, options?: UserDTO): User => {
	const user: User = new User();
	user.usr_id = i;
	user.created_at = new Date();
	user.updated_at = new Date();
	return plainToInstance(User, { ...instanceToPlain(user), ...options });
};
const observableUser = (i = 1, options?: UserDTO): Observable<User> => from([makeUser(i, options)]);

const randomUsersByQuantity = (quantity: number, options?: UserDTO): Observable<User[]> =>
	from(Array(quantity).keys()).pipe(
		map((i) => makeUser(i + 1, options)),
		toArray(),
	);

describe('UserController', () => {
	let service: UserService;
	let controller: UserController;
	let testingModule: TestingModule;

	const users = randomUsersByQuantity(2);

	const mockUsersController = {
		updateUser: jest.fn((id: number, userUpdate: UserDTO) =>
			observableUser().pipe(
				map(() => makeUser(id, userUpdate)),
				switchMap((user) => from([user])),
			),
		),
		createUser: jest.fn((user: UserDTO) => observableUser(1, user)),
		getUsers: jest.fn(() => from(users)),
		getUserById: jest.fn().mockImplementation((id: number) => users.subscribe((users) => users.find((user) => user.usr_id === id))),
	};

	const mockedUsersService = {
		updateUser: jest.fn(),
		createUser: jest.fn().mockImplementation((user: UserDTO) => observableUser(1, user)),
		getUsers: jest.fn().mockImplementation(() => from(users)),
		getUserById: jest.fn().mockImplementation((id: number) => users.subscribe((users) => users.find((user) => user.usr_id === id))),
	};
	const mockedRepo = {
		update: jest
			.fn()
			.mockImplementation((id: number, userUpdate: UserDTO) =>
				users.pipe(map((users) => users.map((u) => (u.usr_id === id ? makeUser(id, userUpdate) : u)))),
			),
		create: jest.fn().mockImplementation((user: UserDTO) => user),
		find: jest.fn(() => Promise.resolve(users)),
		findOneOrFail: jest.fn((id) => Promise.resolve(users.subscribe((users) => users.find((user) => user.usr_id === id)))),
	};

	beforeEach(async () => {
		testingModule = await Test.createTestingModule({
			providers: [
				{
					provide: UserService,
					useFactory: jest.fn(),
					useValue: mockedUsersService,
				},
				{
					provide: UserRepository,
					useFactory: jest.fn(),
				},
				{
					provide: UserController,
					useFactory: jest.fn(),
					useValue: mockUsersController,
				},
				{
					provide: getRepositoryToken(User),
					useValue: mockedRepo,
				},
			],
		}).compile();

		controller = testingModule.get<UserController>(UserController);
		service = testingModule.get<UserService>(UserService);
	});

	afterEach(() => jest.clearAllMocks());

	describe('Both should be defined', () => {
		it('controller should be defined', () => {
			expect(controller).toBeDefined();
		});
		it('service should be defined', () => {
			expect(service).toBeDefined();
		});
	});

	describe('find all in controller', () => {
		it('controller return an array of users', async () => {
			const result: Observable<User[]> = randomUsersByQuantity(2);

			jest.spyOn(service, 'getUsers').mockImplementation(() => result);
			jest.spyOn(controller, 'getUsers').mockImplementation(() => result);

			const expected = result;
			const got = controller.getUsers();

			expected.pipe(
				map((usersExpected) => {
					got.pipe(
						map((usersGot) => {
							expect(usersExpected).toEqual(usersGot);
						}),
					);
				}),
			);

			expect(controller.getUsers).toHaveBeenCalledTimes(1);
			expect(service.getUsers).toHaveBeenCalledTimes(0);
			expect(got).toEqual(expected);
			expect(got).toBeInstanceOf(Observable);
		});
	});

	describe('creating users', () => {
		it('should create a user', () => {
			const createUserDto: UserDTO = {
				usr_name: 'testing',
				usr_last_name: 'lasttesting',
				usr_email: 'test@example.com',
			};

			controller
				.createUser(createUserDto)
				.subscribe((user) => {
					expect(user).toBeDefined();
					expect(user.usr_name).toEqual(createUserDto.usr_name);
					expect(user.usr_last_name).toEqual(createUserDto.usr_last_name);
					expect(user.usr_email).toEqual(createUserDto.usr_email);
				})
				.unsubscribe();
		});
	});

	describe('updating users', () => {
		it('should update a user', async () => {
			const updateUserDto: UserDTO = {
				usr_name: 'testing',
				usr_last_name: 'lasttesting',
				usr_email: 'test@example.com',
			};
			const productId = 1;

			let userUpdated: User = {} as User;
			controller
				.updateUser(productId, updateUserDto)
				.subscribe((user) => {
					userUpdated = user;
				})
				.unsubscribe();

			await delay(200);

			if (userUpdated) {
				expect(userUpdated).toBeDefined();
				expect(userUpdated?.usr_name).toEqual(updateUserDto.usr_name);
				expect(userUpdated?.usr_last_name).toEqual(updateUserDto.usr_last_name);
				expect(userUpdated?.usr_email).toEqual(updateUserDto.usr_email);
			}
		});
	});
});
