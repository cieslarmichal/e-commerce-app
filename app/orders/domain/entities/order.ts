import { Type } from 'class-transformer';
import { IsUUID, IsString, IsArray, ValidateNested, IsDate, IsNumber } from 'class-validator';
import { OrderItem } from './orderItem';

export class Order {
  @IsUUID('4')
  public id?: string;

  @IsString()
  public email: string;

  @IsDate()
  public orderDate?: string;

  @IsNumber()
  public totalPrice?: number;

  @Type(() => OrderItem)
  @ValidateNested({ each: true })
  @IsArray()
  public items: OrderItem[];
}
