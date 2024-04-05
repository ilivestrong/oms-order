import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './orderitem.entity';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'OMS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:5010',
          package: "oms",
          protoPath: "src/protos/product.proto",
        },
      },
    ]),
    TypeOrmModule.forFeature([Order, OrderItem])
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [TypeOrmModule, OrderService]
})
export class OrderModule { }
