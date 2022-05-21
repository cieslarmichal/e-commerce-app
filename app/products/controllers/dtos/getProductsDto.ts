import { ProductDto } from './productDto';

export class GetProductsResponseData {
  public constructor(public readonly products: ProductDto[]) {}
}

export class GetProductsResponseDto {
  public constructor(public readonly data: GetProductsResponseData, public readonly statusCode: number) {}
}
