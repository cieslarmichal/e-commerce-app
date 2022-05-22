import { IsOptional, IsString, IsNumber } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';

export class ProductDto {
  @IsString()
  public readonly id: string;

  @IsString()
  public readonly name: string;

  @IsString()
  public readonly category: string;

  @IsNumber()
  public readonly price: number;

  @IsOptional()
  @IsString()
  public readonly description?: string | null;

  public static readonly create = RecordToInstanceTransformer.transformFactory(ProductDto);
}
