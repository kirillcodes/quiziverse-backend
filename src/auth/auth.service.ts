import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashSync, compareSync } from 'bcryptjs';
import { ROLES } from 'src/users/enums/roles.enum';
import { UsersService } from 'src/users/users.service';
import { MailService } from './mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(email: string, password: string) {
    const candidate = await this.userService.getUserByEmail(email);

    if (candidate) {
      throw new HttpException(
        'User with specific email exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = hashSync(password);

    let username: string = '';
    let role: string = '';

    try {
      const [firstName, lastName] = email.split('@')[0].split('.');
      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);
      username = `${capitalize(firstName)} ${capitalize(lastName)}`;

      role =
        email.split('@')[1] === process.env.TEACHER_EMAIL_DOMAIN
          ? ROLES.TEACHER
          : ROLES.STUDENT;
    } catch {
      throw new HttpException('Email is incorrect', HttpStatus.BAD_REQUEST);
    }

    const activationLink = uuidv4();
    await this.mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/auth/activate/${activationLink}`,
    );

    const isActivated: boolean = false;

    const user = await this.userService.createUser(
      username,
      email,
      hashedPassword,
      activationLink,
      isActivated,
      role,
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

    const token = await this.jwtService.signAsync({
      id: candidate.id,
      role: candidate.role,
    });

    return { token };
  }

  async getRole(userId: number) {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const role = { role: user.role };

    return role;
  }
}
