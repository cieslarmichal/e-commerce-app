import { ProductNotFoundError } from '../errors';
import { ProductDto } from '../dtos';
import { Product } from '../entities';
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ProductMapper } from '../mappers';
import { v4 as uuid4 } from 'uuid';

export class ProductRepository {
  public constructor(private readonly dynamoDbClient: DynamoDBClient, private readonly productMapper: ProductMapper) {}

  public async createOne(productData: Product): Promise<ProductDto> {
    productData.id = uuid4();

    await this.dynamoDbClient.send(
      new PutItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Item: marshall(productData || {}),
      }),
    );

    const createdProduct = await this.findOne(productData.id);

    if (!createdProduct) {
      throw new ProductNotFoundError(productData.id);
    }

    return createdProduct;
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

  public async updateOne(id: string, productData: Partial<Omit<Product, 'id'>>): Promise<ProductDto> {
    const productExists = await this.exists(id);

    if (!productExists) {
      throw new ProductNotFoundError(id);
    }

    // @ts-ignore
    const productDataKeysWithDefinedValues = Object.keys(productData).filter((key) => productData[key]);

    console.log(productDataKeysWithDefinedValues);

    const response = await this.dynamoDbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
        UpdateExpression: `SET ${productDataKeysWithDefinedValues
          .map((_, index) => `#key${index} = :value${index}`)
          .join(', ')}`,
        ExpressionAttributeNames: productDataKeysWithDefinedValues.reduce(
          (previousValue, currentValue, index) => ({
            ...previousValue,
            [`#key${index}`]: currentValue,
          }),
          {},
        ),
        ExpressionAttributeValues: marshall(
          productDataKeysWithDefinedValues.reduce(
            (previousValue, currentValue, index) => ({
              ...previousValue,
              // @ts-ignore
              [`:value${index}`]: productData[currentValue],
            }),
            {},
          ),
        ),
        ReturnValues: 'ALL_NEW',
      }),
    );

    const updatedProduct = response.Attributes ? unmarshall(response.Attributes) : {};

    return this.productMapper.mapEntityToDto(updatedProduct);
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
