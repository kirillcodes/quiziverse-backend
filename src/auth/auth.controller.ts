import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() dto: CreateUserDto) {
    const user = await this.authService.signUp(dto.email, dto.password);

    return user;
  }

  @Post('sign-in')
  async signIn(@Body() dto: CreateUserDto) {
    const token = await this.authService.signIn(dto.email, dto.password);

    return token;
  }
}
