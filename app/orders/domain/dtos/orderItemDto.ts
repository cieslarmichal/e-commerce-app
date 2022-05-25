import { IsNumber, IsString } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';

export class OrderItemDto {
  @IsString()
  public readonly name: string;

  @IsNumber()
  public readonly price: number;

  @IsNumber()
  public readonly amount: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(OrderItemDto);
}
