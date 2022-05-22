import { ProductNotFoundError } from '../errors';
import { ProductDto } from '../dtos';
import { Product } from '../entities';
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ProductMapper } from '../mappers';

export class ProductRepository {
  public constructor(private readonly dynamoDbClient: DynamoDBClient, private readonly productMapper: ProductMapper) {}

  public async createOne(productData: Product): Promise<ProductDto> {
    const response = await this.dynamoDbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id: productData.id }),
        UpdateExpression: `SET ${Object.keys(productData)
          .map((key) => `${key} = :${key}`)
          .join(', ')}`,
        ExpressionAttributeValues: Object.keys(productData).reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            // @ts-ignore
            [`:${currentValue}`]: productData[currentValue],
          }),
          {},
        ),
        ReturnValues: 'ALL_NEW',
      }),
    );

    return this.productMapper.mapEntityToDto(response.Attributes || {});
  }

  public async findOne(id: string): Promise<ProductDto | null> {
    const { Item } = await this.dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
      }),
    );

    if (!Item) {
      return null;
    }

    const product = unmarshall(Item);

    return this.productMapper.mapEntityToDto(product);
  }

  public async exists(id: string): Promise<boolean> {
    const { Item } = await this.dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
      }),
    );

    return Item ? true : false;
  }

  public async findMany(): Promise<ProductDto[]> {
    const { Items } = await this.dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.DB_TABLE_NAME,
      }),
    );

    const products = Items ? Items.map((item) => unmarshall(item)) : [];

    return products.map((product) => this.productMapper.mapEntityToDto(product));
  }

  public async updateOne(id: string, productData: Partial<Product>): Promise<ProductDto> {
    const productExists = await this.exists(id);

    if (!productExists) {
      throw new ProductNotFoundError(id);
    }

    const response = await this.dynamoDbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
        UpdateExpression: `SET ${Object.keys(productData)
          .map((key) => `${key} = :${key}`)
          .join(', ')}`,
        ExpressionAttributeValues: Object.keys(productData).reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            // @ts-ignore
            [`:${currentValue}`]: productData[currentValue],
          }),
          {},
        ),
        ReturnValues: 'ALL_NEW',
      }),
    );

    return this.productMapper.mapEntityToDto(response.Attributes || {});
  }

  public async removeOne(id: string): Promise<void> {
    const productExists = await this.exists(id);

    if (!productExists) {
      throw new ProductNotFoundError(id);
    }

    await this.dynamoDbClient.send(
      new DeleteItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
      }),
    );
  }
}
