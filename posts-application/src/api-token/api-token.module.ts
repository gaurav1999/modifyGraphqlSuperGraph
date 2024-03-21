import { Module } from '@nestjs/common';
import { ApiTokenResolver } from './api-token.resolver';
import { ApiTokenServiceNest } from './api-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiToken } from './entities/api-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiTokenGrpcController } from './api-token-grpc.controller';


@Module({
  imports: [TypeOrmModule.forFeature([ApiToken]), JwtModule.register({ secret: process.env.JWT_TOKEN_SECRET }), 
  ClientsModule.register([
    {
      name: 'APITOKEN',
      transport: Transport.GRPC,
      options: {
        url: "localhost:5000",
        package: 'apitoken',
        protoPath: 'src/proto/token.proto',
      },
    },
  ])],
  controllers: [ApiTokenGrpcController],
  providers: [ApiTokenResolver, ApiTokenServiceNest]
})
export class ApiTokenModule {}