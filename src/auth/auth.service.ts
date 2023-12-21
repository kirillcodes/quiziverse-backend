import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashSync, compareSync } from 'bcryptjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string) {
    const candidate = await this.userService.getUserByEmail(email);

    if (candidate) {
      throw new HttpException(
        'User with specific email exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    let username = '';

    try {
      const [firstName, lastName] = email.split('@')[0].split('.');
      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);
      username = `${capitalize(firstName)} ${capitalize(lastName)}`;
    } catch {
      throw new HttpException('Email is incorrect', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = hashSync(password);

    const user = await this.userService.createUser(
      username,
      email,
      hashedPassword,
    );

    return user;
  }

  async signIn(email: string, password: string) {
    const candidate = await this.userService.getUserByEmail(email);

    if (!candidate) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const validPassword = compareSync(password, candidate.password);

    if (!validPassword) {
      throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
    }

    const token = await this.jwtService.signAsync({ credential: email });

    return { email, token };
  }
}
