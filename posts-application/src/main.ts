import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'apitoken',
      protoPath: join(__dirname, '../src/proto/token.proto'),
    }});
  await app.startAllMicroservices();
  await app.listen(3003);
}
bootstrap();
