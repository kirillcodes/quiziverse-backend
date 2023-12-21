import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly secretKey = process.env.SECRET_KEY;

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
      }

      jwt.verify(token, this.secretKey);

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
