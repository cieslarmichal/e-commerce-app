import { GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from './dynamoDbClient';

exports.handler = async function (event) {
  console.log(event);

  let body;

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
