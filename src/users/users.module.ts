import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { UserCourse } from './user-course.model';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [SequelizeModule.forFeature([User, UserCourse])],
  exports: [UsersService],
})
export class UsersModule {}
