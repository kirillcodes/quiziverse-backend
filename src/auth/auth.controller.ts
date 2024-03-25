import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
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
    const user = await this.authService.signIn(dto.email, dto.password);
    return user;
  }

  @Get('role')
  async getRole(@Req() req: Request) {
    const userId = req.user.id;
    const role = await this.authService.getRole(userId);
    return role;
  }
}
