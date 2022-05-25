import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { OrderItemData } from './orderItemData';

export class CreateOrderData {
  @IsString()
  public readonly email: string;

  @Type(() => OrderItemData)
  @ValidateNested({ each: true })
  @IsArray()
  public readonly items: OrderItemData[];
}
