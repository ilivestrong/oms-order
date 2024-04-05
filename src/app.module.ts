import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order/order.controller';
import { Order } from './order/order.entity';
import { OrderItem } from './order/orderitem.entity';

@Module({
  imports: [OrderModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "oms",
      entities: [Order, OrderItem],
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController, OrderController],
  providers: [AppService],
})
export class AppModule {}
