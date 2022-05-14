import { GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from './dynamoDbClient';

exports.handler = async function (event) {
  console.log(event);

  switch (event.httpMethod) {
    case 'GET': {
      if (event.pathParameters !== null) {
        body = await getProduct(event.pathParameters.id);
      } else {
        body = await getAllProducts();
      }
    }
  }

  return {
    statusCode: 200,
    body: `hello, hitting ${event.path}`,
  };
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
