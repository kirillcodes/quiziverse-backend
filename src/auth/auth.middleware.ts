import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    user: {
      id: number;
      email: string;
      role: string;
    };
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly secretKey = process.env.SECRET_KEY;

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Not authorized');
      }

      const decodedToken = jwt.verify(token, this.secretKey) as {
        id: number;
        email: string;
        role: string;
      };

      if (decodedToken) {
        req.user = decodedToken;
      } else {
        throw new UnauthorizedException('Invalid token');
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }

      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
