import { IsString } from 'class-validator';
import { ProductDto } from './productDto';

export class GetProductParamDto {
  @IsString()
  public readonly id: string;
}

export class GetProductResponseData {
  public constructor(public readonly product: ProductDto) {}
}
