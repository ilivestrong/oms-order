
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { OrderItem } from "./orderitem.entity";
import { ArrayMinSize, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    @IsNotEmpty()
    customer_id: string

    @Column()
    @IsNumber()
    total_price: number

    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
    order_items: OrderItem[];
}