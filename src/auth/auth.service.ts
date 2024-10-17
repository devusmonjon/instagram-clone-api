import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
    const existUser = await this.isExistUser(dto.username, dto.email);
    if (existUser)
      throw new ConflictException(
        'User with that email or username is already exists in the system',
      );

    const salt = await genSalt(10);
    const passwordHash = await hash(dto.password, salt);

    const newUser = await this.userModel.create({
      ...dto,
      fullName: dto.full_name,
      password: passwordHash,
      emailActivated: false,
      role: 'USER',
    });

    const token = await this.issueTokenPari(String(newUser._id));

    return { user: this.getUserField(newUser), ...token };
  }

  async login(dto: LoginDto) {
    const existUser = await this.isExistUser(dto.username);
    if (!existUser) throw new NotFoundException('User not found');

    const passwordCompare = await compare(dto.password, existUser.password);

    if (!passwordCompare) throw new BadRequestException('Wrong password');

    const token = await this.issueTokenPari(String(existUser._id));

    return { user: this.getUserField(existUser), ...token };
  }

  async getNewTokens({ refreshToken }: TokenDto) {
    if (!refreshToken) throw new NotFoundException('Refresh token not found');

    let result = null;
    try {
      result = await this.jwtService.verifyAsync(refreshToken);
    } catch (e) {
      throw new BadRequestException('Token ivalid or expired');
    }

    if (!result) throw new BadRequestException('Token ivalid or expired');

    const user = await this.userModel.findById(result._id);

    if (!user) throw new NotFoundException('User not found');

    const token = await this.issueTokenPari(String(user._id));

    return { user: this.getUserField(user), ...token };
  }

  async isExistUser(
    username: string,
    email: string | boolean = false,
  ): Promise<UserDocument | false> {
    const existUserWithUsername = await this.userModel.findOne({ username });
    const existUserWithEmail = await this.userModel.findOne({ email });
    const existUser = existUserWithUsername || existUserWithEmail;
    return existUser ? existUser : false;
  }

  async issueTokenPari(userId: string) {
    const data = { _id: userId };

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '15w',
    });
    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '2w',
    });

    return { accessToken, refreshToken };
  }

  getUserField(user: UserDocument) {
    return {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      photo: user.photo,
      emailActivated: user.emailActivated,
    };
  }
}
