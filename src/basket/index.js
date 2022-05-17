import { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from './dynamoDbClient';

exports.handler = async function (event) {
  console.log(event);

  let body;

  try {
    switch (event.httpMethod) {
      case 'GET': {
        if (event.pathParameters !== null) {
          const email = event.pathParameters.email;

          body = await getBasket(email);
        } else {
          body = await getAllBaskets();
        }

        break;
      }
      case 'POST': {
        if (event.path === '/basket/checkout') {
          body = await checkoutBasket();
        } else {
          const basketProperties = JSON.parse(event.body);

          body = await createBasket(basketProperties);
        }

        break;
      }
      case 'DELETE': {
        const basketId = event.pathParameters.id;

        body = await deleteBasket(basketId);

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

const getBasket = async (email) => {
  console.log('getBasket', email);

  try {
    const { Item } = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ email }),
      }),
    );

    console.log(Item);

    return Item ? unmarshall(Item) : {};
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getAllBaskets = async () => {
  console.log('getBaskets');

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

const createBasket = async (basketProperties) => {
  console.log('createBasket', basketProperties);

  try {
    const result = await dynamoDbClient.send(
      new PutItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Item: marshall(basketProperties || {}),
      }),
    );

    console.log(result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteBasket = async (email) => {
  console.log('deleteBasket', email);

  try {
    const result = await dynamoDbClient.send(
      new DeleteItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ email }),
      }),
    );

    console.log('Success, item deleted', result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const checkoutBasket = async () => {
  console.log('checkoutBasket');

  try {
    const result = await dynamoDbClient.send(
      new DeleteItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Key: marshall({ id: basketId }),
      }),
    );

    console.log('Success, item deleted', result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
