import { Type } from 'class-transformer';
import { IsUUID, IsString, IsArray, ValidateNested, IsDate, IsNumber } from 'class-validator';
import { OrderItem } from './orderItem';

export class Order {
  @IsUUID('4')
  public readonly id: string;

  @IsString()
  public readonly email: string;

  @IsDate()
  public readonly orderDate: string;

  @IsNumber()
  public readonly totalPrice: number;

  @Type(() => OrderItem)
  @ValidateNested({ each: true })
  @IsArray()
  public readonly items: OrderItem[];
}
