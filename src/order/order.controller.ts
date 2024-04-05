import { Controller, Logger } from '@nestjs/common';
import { CreateOrderRequest, CreateOrderResponse, ListOrdersResponse, OrderServiceController, OrderServiceControllerMethods } from 'src/protos/order';
import { OrderService } from './order.service';
import { Empty } from 'src/protos/google/protobuf/empty';

@Controller('order')
@OrderServiceControllerMethods()
export class OrderController implements OrderServiceController {
    private readonly logger = new Logger(OrderController.name);

    constructor(
        private orderService: OrderService,
    ) { }

    list(request: Empty): Promise<ListOrdersResponse> {
        return this.orderService.listOrders()
    }
    create(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        return this.orderService.create(request);
    }
}
