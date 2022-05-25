import { Type } from 'class-transformer';
import { IsUUID, IsString, IsArray, ValidateNested, IsDate, IsNumber } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';
import { OrderItemDto } from './orderItemDto';

export class OrderDto {
  @IsUUID('4')
  public readonly id: string;

  @IsString()
  public readonly email: string;

  @IsDate()
  public readonly orderDate: string;

  @IsNumber()
  public readonly totalPrice: number;

  @Type(() => OrderItemDto)
  @ValidateNested({ each: true })
  @IsArray()
  public readonly items: OrderItemDto[];

  public static readonly create = RecordToInstanceTransformer.transformFactory(OrderDto);
}
