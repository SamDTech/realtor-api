import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SignInParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(
    { email, password, name, phone }: SignUpParams,
    userType: UserType,
  ) {
    const userExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist) {
      throw new BadRequestException('User already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        user_type: userType,
      },
    });

    const token = jwt.sign({ name, id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return { token };
  }

  async signin({ email, password }: SignInParams) {
    // check if the email exist
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User does not Exist');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch || !user) {
      throw new BadRequestException('Invalid Credentials');
    }

    const token = this.generateToken({ name: user.name, id: user.id });

    return { token };
  }

  async generateToken(payload: { name: string; id: number }): Promise<string> {
    return await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }

  async verifyToken(token: string): Promise<string | jwt.JwtPayload> {
    return await jwt.verify(token, process.env.JWT_SECRET);
  }

  generateProductkey(email: string, userType: UserType): Promise<string> {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return bcrypt.hash(string, 12);
  }
}
