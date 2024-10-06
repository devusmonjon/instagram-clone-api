import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { getMongoDBConfig } from './config/mongo.config';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoDBConfig,
    }),

    AuthModule,
    PostModule,
    UserModule,
    MailModule,
    ChatModule,
  ],
})
export class AppModule {}
