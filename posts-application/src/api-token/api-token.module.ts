import { Module } from '@nestjs/common';
import { ApiTokenResolver } from './api-token.resolver';
import { ApiTokenService } from './api-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiToken } from './entities/api-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiToken])],
  providers: [ApiTokenResolver, ApiTokenService]
})
export class ApiTokenModule {}