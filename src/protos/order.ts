/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Empty } from "./google/protobuf/empty.js";
import { Timestamp } from "./google/protobuf/timestamp.js";

export const protobufPackage = "oms";

export interface Order {
  id: string;
  customerId: string;
  totalPrice: number;
  orderItems: OrderItem[];
  createdAt: Timestamp | undefined;
}

export interface OrderItem {
  productId: string;
  qty: number;
}

export interface ListOrdersResponse {
  orders: Order[];
}

export interface CreateOrderRequest {
  customerId: string;
  orderItems: OrderItem[];
}

export interface CreateOrderResponse {
  order: Order | undefined;
}

export const OMS_PACKAGE_NAME = "oms";

export interface OrderServiceClient {
  list(request: Empty): Observable<ListOrdersResponse>;

  create(request: CreateOrderRequest): Observable<CreateOrderResponse>;
}

export interface OrderServiceController {
  list(request: Empty): Promise<ListOrdersResponse> | Observable<ListOrdersResponse> | ListOrdersResponse;

  create(
    request: CreateOrderRequest,
  ): Promise<CreateOrderResponse> | Observable<CreateOrderResponse> | CreateOrderResponse;
}

export function OrderServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["list", "create"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("OrderService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("OrderService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ORDER_SERVICE_NAME = "OrderService";
