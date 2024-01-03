import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    user?: {
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
        throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
      }

      try {
        const decodedToken = jwt.verify(token, this.secretKey) as {
          id: number;
          email: string;
          role: string;
        };

        if (decodedToken) {
          req.user = decodedToken;
        } else {
          throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
        }
      } catch (jwtError) {
        throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException('Forbidden', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
