import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { User } from './users/users.model';
import { AuthMiddleware } from './auth/auth.middleware';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/courses.model';
import { UserCourse } from './users/user-course.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User, Course, UserCourse],
      autoLoadModels: true,
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: `/auth/sign-in`, method: RequestMethod.POST },
        { path: `/auth/sign-up`, method: RequestMethod.POST },
        { path: `/auth/logout`, method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
