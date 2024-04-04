import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { compareSync, hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async createUser(
    username: string,
    email: string,
    password: string,
    activationLink: string,
    isActivated: boolean,
    role: string,
  ) {
    const user = await this.userRepository.create({
      username,
      email,
      password,
      activationLink,
      isActivated,
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

  async activate(activationLink: string) {
    const user = await this.userRepository.findOne({
      where: { activationLink },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActivated = true;
    user.activationLink = null;
    await user.save();

    return true;
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async changePassword(
    previousPassword: string,
    newPassword: string,
    userId: number,
  ) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validPassword = compareSync(previousPassword, user.password);

    if (!validPassword) {
      throw new BadRequestException('Password is incorrect');
    }

    const hashedPassword = hashSync(newPassword);

    user.password = hashedPassword;
    await user.save();

    return true;
  }
}
