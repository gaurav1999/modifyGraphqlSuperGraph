import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { ApiTokenModule } from './api-token/api-token.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PostsModule, ApiTokenModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
