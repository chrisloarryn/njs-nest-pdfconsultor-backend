import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../src/api/repository'
import { UserController } from '../src/api/controller';
import { UserService } from '../src/api/service';
import { WinstonModule } from 'nest-winston';
import { LoggerConfig, } from '../src/config';

const logger: LoggerConfig = new LoggerConfig();

describe('Test (e2e)', () => {
  let app: INestApplication;
  const mockUser = [
    {
      id: 1,
      name: 'test1',
      lastname: 'the-brand-1',
      email: 'the-category-1',
    },
    {
      id: 2,
      name: 'testing',
      lastname: 'the-brand-1',
      email: 'the-category-1',
    },
  ]
  const mockUserRepository = {
    getAllUsers: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
    saveUser: jest.fn().mockImplementation((dto) => {
      return {
        id: Math.random() * (1000 - 1) + 1,
        ...dto,
      };
    }),
    updateUser: jest.fn().mockImplementation((newUser) => { Promise.resolve(newUser) })
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WinstonModule.forRoot(logger.console())],
      controllers: [UserController],
      providers: [UserService, UserRepository],
    }).overrideProvider(UserRepository)
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init()
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/users/')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(mockUser);
  });
  it('/user (POST)', () => {
    const createUserDto = {
      name: 'the-product',
      lastname: 'the-brand',
      email: 'the-category',
    };

    return request(app.getHttpServer())
      .post('/v1/users/')
      .send(createUserDto)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          id: expect.any(Number),
          ...createUserDto,
        });
      });
  });


  afterAll(async () => {
    await app.close();
  });


});
