import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';

type Passwords = {
  previousPassword: string;
  newPassword: string;
};

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {
    const userId = req.user.id;
    const profile = await this.userService.getProfile(userId);
    return profile;
  }

  @Put('change-password')
  async changePassword(@Body() body: Passwords, @Req() req: Request) {
    const userId = req.user.id;
    const { previousPassword, newPassword } = body;
    return await this.userService.changePassword(
      previousPassword,
      newPassword,
      userId,
    );
  }
}
