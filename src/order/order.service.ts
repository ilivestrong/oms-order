import { BadRequestException, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Order } from './order.entity';
import { ProductServiceClient } from 'src/protos/product';
import { Order as OrderProto } from 'src/protos/order';
import { CreateOrderRequest, CreateOrderResponse, ListOrdersResponse } from 'src/protos/order';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { status } from '@grpc/grpc-js';

@Injectable()
export class OrderService implements OnModuleInit {
    private productServiceClient: ProductServiceClient;
    private logger = new Logger(OrderService.name);

    constructor(
        @Inject("OMS_PACKAGE")
        private grpcClient: ClientGrpc,

        @InjectRepository(Order)
        private orderRepository: Repository<Order>,

    ) { }

    onModuleInit() {
        this.productServiceClient = this.grpcClient.getService<ProductServiceClient>("ProductService");
    }

    async listOrders(): Promise<ListOrdersResponse> {
        const orders = await this.orderRepository.find({ relations: ["order_items"] })
        if (!orders || orders.length == 0) {
            const e = makeError(status.NOT_FOUND, `no orders found.`)
            this.logger.log(e)
            throw new RpcException(e)
        }
        return Promise.resolve({
            orders: toOrdersProto(orders)
        })
    }

    async create({ orderItems }: CreateOrderRequest): Promise<CreateOrderResponse> {
        try {
            if (!orderItems || orderItems.length == 0) {
                throw new RpcException(makeError(status.NOT_FOUND, `order is empty`))
            }

            let productPriceMap = {};
            for (const { productId, qty } of orderItems) {
                const product = await firstValueFrom(this.productServiceClient.get({ productId }));
                if (qty > product.availableQty) {
                    throw new RpcException(`cannot process order: product: ${productId} has insufficient quantity: ${product.availableQty}`);
                }
                productPriceMap[product.id] = product.price;
            }

            // We aren't maintaining Customer entity for this assessment.
            // But an order belongs to a customer, so create a dummy one.
            const customerID = uuidv4();
            let totalOrderPrice = 0
            let order = this.orderRepository.create();
            order.customer_id = customerID;
            order.order_items = [];

            for (const oi of orderItems) {
                totalOrderPrice += productPriceMap[oi.productId] * oi.qty
                order.order_items.push({
                    id: uuidv4(),
                    product_id: oi.productId,
                    quantity: oi.qty,
                    order,
                })
            }
            order.total_price = totalOrderPrice;

            await this.orderRepository.save(order);
            for (const { productId, qty } of orderItems) {
                await firstValueFrom(this.productServiceClient.decrementQty({ productId, offset: qty }));
            }

            return { order: toOrderProto(order) };
        } catch (error: any) {
            this.logger.debug(error.message)
            throw new RpcException({ code: error.code, message: error.message })
        }
    }
}

function toOrdersProto(orders: Order[]): OrderProto[] {
    let o: OrderProto[] = [];

    for (const { id, customer_id, total_price, order_items } of orders) {
        o.push(toOrderProto({ id, customer_id, total_price, order_items }))
    }
    return o;
}

function toOrderProto({ id, customer_id, total_price, order_items }: Order): OrderProto {
    const currentDate = new Date();
    const result = {
        id,
        customerId: customer_id,
        totalPrice: total_price,
        orderItems: order_items.map((oi) => ({
            productId: oi.product_id,
            qty: oi.quantity,
        })),
        createdAt: {
            seconds: Math.floor(currentDate.getTime() / 1000),
            nanos: currentDate.getMilliseconds() * 1e6
        }
    }
    return result;
}

function makeError(code: status, message: string) {
    return { code, message }
}
