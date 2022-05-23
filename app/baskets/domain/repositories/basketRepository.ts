import { BasketNotFoundError } from '../errors';
import { BasketDto } from '../dtos';
import { Basket } from '../entities';
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { BasketMapper } from '../mappers';
import { v4 as uuid4 } from 'uuid';

export class BasketRepository {
  public constructor(private readonly dynamoDbClient: DynamoDBClient, private readonly basketMapper: BasketMapper) {}

  public async createOne(basketData: Basket): Promise<BasketDto> {
    basketData.id = uuid4();

    await this.dynamoDbClient.send(
      new PutItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Item: marshall(basketData || {}),
      }),
    );

    const createdBasket = await this.findOne(basketData.id);

    if (!createdBasket) {
      throw new BasketNotFoundError(basketData.id);
    }

    return createdBasket;
  }

  public async findOne(id: string): Promise<BasketDto | null> {
    const { Item } = await this.dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
      }),
    );

    if (!Item) {
      return null;
    }

    const basket = unmarshall(Item);

    return this.basketMapper.mapEntityToDto(basket);
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

  public async findMany(): Promise<BasketDto[]> {
    const { Items } = await this.dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.DB_TABLE_NAME,
      }),
    );

    const baskets = Items ? Items.map((item) => unmarshall(item)) : [];

    return baskets.map((basket) => this.basketMapper.mapEntityToDto(basket));
  }

  public async updateOne(id: string, basketData: Partial<Omit<Basket, 'id'>>): Promise<BasketDto> {
    const basketExists = await this.exists(id);

    if (!basketExists) {
      throw new BasketNotFoundError(id);
    }

    // @ts-ignore
    const basketDataKeysWithDefinedValues = Object.keys(basketData).filter((key) => basketData[key]);

    console.log(basketDataKeysWithDefinedValues);

    const response = await this.dynamoDbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
        UpdateExpression: `SET ${basketDataKeysWithDefinedValues
          .map((_, index) => `#key${index} = :value${index}`)
          .join(', ')}`,
        ExpressionAttributeNames: basketDataKeysWithDefinedValues.reduce(
          (previousValue, currentValue, index) => ({
            ...previousValue,
            [`#key${index}`]: currentValue,
          }),
          {},
        ),
        ExpressionAttributeValues: marshall(
          basketDataKeysWithDefinedValues.reduce(
            (previousValue, currentValue, index) => ({
              ...previousValue,
              // @ts-ignore
              [`:value${index}`]: basketData[currentValue],
            }),
            {},
          ),
        ),
        ReturnValues: 'ALL_NEW',
      }),
    );

    const updatedBasket = response.Attributes ? unmarshall(response.Attributes) : {};

    return this.basketMapper.mapEntityToDto(updatedBasket);
  }

  public async removeOne(id: string): Promise<void> {
    const basketExists = await this.exists(id);

    if (!basketExists) {
      throw new BasketNotFoundError(id);
    }

    await this.dynamoDbClient.send(
      new DeleteItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id }),
      }),
    );
  }
}