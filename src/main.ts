import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: "localhost:5011", 
      protoPath: "src/protos/order.proto",
      package: "oms"
    }
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
