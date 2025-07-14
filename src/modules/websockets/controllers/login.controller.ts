import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    const SECRET = process.env.TOKEN_SECRET;
    const users = JSON.parse(process.env.USERS);

    const user = users.find(
      (u: any) => u.email === body.email && u.password === body.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign({ email: user.email, name: user.name }, SECRET, {
      expiresIn: '1h',
    });

    return { token };
  }
}
