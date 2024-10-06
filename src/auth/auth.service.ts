import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { RegisterDto } from './dto/register.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existUser = await this.isExistUser(dto.email);
    if (existUser)
      throw new ConflictException(
        'User with that email is already exists in the system',
      );

    const salt = await genSalt(10);
    const passwordHash = await hash(dto.password, salt);

    const newUser = await this.userModel.create({
      ...dto,
      fullName: dto.full_name,
      password: passwordHash,
      role: 'USER',
    });

    const token = await this.issueTokenPari(String(newUser._id));

    return { user: this.getUserField(newUser), ...token };
  }

  async login(dto: LoginDto) {
    const existUser = await this.isExistUser(dto.email);
    if (!existUser) throw new UnauthorizedException('User not found');

    const passwordCompare = await compare(dto.password, existUser.password);

    if (!passwordCompare) throw new UnauthorizedException('Wrong password');

    const token = await this.issueTokenPari(String(existUser._id));

    return { user: this.getUserField(existUser), ...token };
  }

  async getNewTokens({ refreshToken }: TokenDto) {
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found');

    const result = await this.jwtService.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Token ivalid or expired');

    const user = await this.userModel.findById(result._id);

    const token = await this.issueTokenPari(String(user._id));

    return { user: this.getUserField(user), ...token };
  }

  async isExistUser(email: string): Promise<UserDocument | false> {
    const existUser = await this.userModel.findOne({ email });
    return existUser ? existUser : false;
  }

  async issueTokenPari(userId: string) {
    const data = { _id: userId };

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '15d',
    });
    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h',
    });

    return { accessToken, refreshToken };
  }

  getUserField(user: UserDocument) {
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    };
  }
}
