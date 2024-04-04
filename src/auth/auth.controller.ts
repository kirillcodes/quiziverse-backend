import { AuthService } from './auth.service';
import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

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

  @Get('activate/:link')
  async activate(@Param('link') activationLink: string, @Res() res: Response) {
    await this.usersService.activate(activationLink);
    return res.redirect(`${process.env.CLIENT_URL}`);
  }
}
