import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './auth.middleware';
import { MailService } from './mail.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [AuthService, AuthMiddleware, MailService],
  controllers: [AuthController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '30d' },
    }),
    UsersModule,
  ],
})
export class AuthModule {}
