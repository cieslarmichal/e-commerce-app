import { ProductDto } from '../dtos';
import { CreateProductData, UpdateProductData } from './types';
import { LoggerService } from '../../../common';
import { ProductRepository } from '../repositories/productRepository';
import { ProductNotFoundError } from '../errors';
import { v4 as uuid4 } from 'uuid';

export class ProductService {
  public constructor(
    private readonly productRepository: ProductRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async createProduct(productData: CreateProductData): Promise<ProductDto> {
    this.loggerService.debug('Creating product...');

    const id = uuid4();

    productData.id = id;
    const product = await this.productRepository.createOne(productData);

    this.loggerService.info('Product created.', { productId: product.id });

    return product;
  }

  public async findProduct(productId: string): Promise<ProductDto> {
    const product = await this.productRepository.findOneById(productId);

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return product;
  }

  public async findProducts(): Promise<ProductDto[]> {
    const products = await this.productRepository.findMany();

    return products;
  }

  public async updateProduct(productId: string, productData: UpdateProductData): Promise<ProductDto> {
    this.loggerService.debug('Updating product...', { productId });

    const product = await this.productRepository.updateOne(productId, productData);

    this.loggerService.info('Product updated.', { productId });

    return product;
  }

  public async removeProduct(productId: string): Promise<void> {
    this.loggerService.debug('Removing product...', { productId });

    await this.productRepository.removeOne(productId);

    this.loggerService.info('Product removed.', { productId });
  }
}
