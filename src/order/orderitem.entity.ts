import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsNotEmpty()
  product_id: string;

  @Column()
  @IsNotEmpty()
  quantity: number;

  @ManyToOne(() => Order, order => order.order_items)
  order: Order;
}
