import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async createUser(
    username: string,
    email: string,
    password: string,
    role: string,
  ) {
    const user = await this.userRepository.create({
      username,
      email,
      password,
      role,
    });
    return user;
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    return users;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findByPk(id);
    return user;
  }
}
