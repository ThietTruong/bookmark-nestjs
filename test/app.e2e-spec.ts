import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto } from 'src/bookmark/dto';
describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.clearDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close;
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('Should signup', () => {
        const dto: AuthDto = {
          email: 'thiettruong1999@gmail.com',
          password: '123',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(403);
      });
      it('should throw password emty ', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'thiettruong1999',
          })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400).inspect();
      });
    });
    describe('Signin', () => {
      it('Should signin', () => {
        const dto: AuthDto = {
          email: 'thiettruong1999@gmail.com',
          password: '123',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      it('should throw password emty ', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'thiettruong1999',
          })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400).inspect();
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('Should get current user', () => {
        return pactum.spec().get('/users/me').withHeaders({
          Authorization: 'Bearer $S{userAt}',
        });
      });
    });
    describe('Edit user', () => {
      it('Should get current user', () => {
        const dto: EditUserDto = {
          firstName: 'Shishi5',
          email: 'thiettruong1999@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.email);
      });
    });
  });
  describe('Bookmark', () => {
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Bookmark 1',
        link: 'link1',
      };
      it('Should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });
    describe('Get bookmarks', () => {
      it('Sh ould get bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Get bookmark by id', () => {});
    describe('Edit bookmark by id', () => {});
    describe('Delete bookmark by id', () => {});
  });
});
