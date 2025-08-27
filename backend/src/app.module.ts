import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { EmailModule } from './email/email.module';
import { RecipesModule } from './recipes/recipes.module';
import { MistralModule } from './mistral/mistral.module';
import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { ArticlesModule } from './articles/articles.module';
import { ChatMessagesModule } from './chat-messages/chat-messages.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    EmailModule,
    RecipesModule,
    ChatModule,
    ArticlesModule,
    ChatMessagesModule,
    MistralModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
