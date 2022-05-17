import {
  GetItemCommand,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from './dynamoDbClient';
import { v4 as uuid4 } from 'uuid';

exports.handler = async function (event) {
  console.log(event);

  try {
    switch (event.httpMethod) {
      case 'GET': {
        if (event.queryStringParameters !== null) {
          const category = event.queryStringParameters.category;

          body = await getProductsByCategory(category);
        } else if (event.pathParameters !== null) {
          const productId = event.pathParameters.id;

          body = await getProduct(productId);
        } else {
          body = await getAllProducts();
        }

        break;
      }
      case 'POST': {
        const productProperties = JSON.parse(event.body);

        body = await createProduct(productProperties);

        break;
      }
      case 'PUT': {
        const productId = event.pathParameters.id;

        const productProperties = JSON.parse(event.body);

        body = await updateProduct(productId, productProperties);

        break;
      }
      case 'DELETE': {
        const productId = event.pathParameters.id;

        body = await deleteProduct(productId);

        break;
      }
      default: {
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
      }
    }

    console.log(body);

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: body,
      }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to perform operation.',
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
  }
};

const getProduct = async (productId) => {
  console.log('getProduct');

  try {
    const { Item } = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id: productId }),
      }),
    );

    console.log(Item);

    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getAllProducts = async () => {
  console.log('getProducts');

  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.DB_TABLE_NAME,
      }),
    );

    console.log(Items);

    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getProductsByCategory = async (category) => {
  console.log('getProductsByCategory', category);

  try {
    const { Items } = await dynamoDbClient.send(
      new ScanCommand({
        TableName: process.env.DB_TABLE_NAME,
        FilterExpression: 'category = :category',
        ExpressionAttributeValues: {
          ':category': { S: category },
        },
      }),
    );

    console.log(Items);

    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createProduct = async (productProperties) => {
  console.log('createProduct', productProperties);

  try {
    const productId = uuid4();

    productProperties.id = productId;

    const result = await dynamoDbClient.send(
      new PutItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Item: marshall(productProperties || {}),
      }),
    );

    console.log(result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteProduct = async (productId) => {
  console.log('deleteProduct', productId);

  try {
    const result = await dynamoDbClient.send(
      new DeleteItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id: productId }),
      }),
    );

    console.log('Success, item deleted', result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateProduct = async (productId, productProperties) => {
  console.log('updateProduct', productId, productProperties);

  try {
    const productPropertiesKeys = Object.keys(productProperties);

    const result = await dynamoDbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id: productId }),
        UpdateExpression: `SET ${productPropertiesKeys.map((_, index) => `#key${index} = :value${index}`).join(', ')}`,
        ExpressionAttributeNames: productPropertiesKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`#key${index}`]: key,
          }),
          {},
        ),
        ExpressionAttributeValues: marshall(
          productPropertiesKeys.reduce(
            (acc, key, index) => ({
              ...acc,
              [`:value${index}`]: productProperties[key],
            }),
            {},
          ),
        ),
      }),
    );

    console.log('Success, item updated', result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
