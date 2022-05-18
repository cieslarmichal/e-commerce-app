import { QueryCommand, ScanCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from './dynamoDbClient';

exports.handler = async function (event) {
  console.log(event);

  const eventType = event['detail-type'];

  if (eventType !== undefined) {
    await handleEventBusEvent(event);
  } else {
    const response = await handleApiGatewayEvent(event);

    return response;
  }
};

const handleEventBusEvent = async (event) => {
  console.log('Event bus invocation');

  await createOrder(event.detail);
};

const handleApiGatewayEvent = async (event) => {
  let body;

  try {
    switch (event.httpMethod) {
      case 'GET': {
        if (event.pathParameters !== null) {
          const { email } = event.pathParameters;

          const { orderDate } = event.queryStringParameters;

          body = await getOrder(email, orderDate);
        } else {
          body = await getAllOrders();
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

const createOrder = async (orderProperties) => {
  console.log('createOrder', orderProperties);

  try {
    const orderDate = new Date().toISOString();

    orderProperties.orderDate = orderDate;

    const result = await dynamoDbClient.send(
      new PutItemCommand({
        TableName: process.env.DB_TABLE_NAME,
        Item: marshall(orderProperties || {}),
      }),
    );

    console.log(result);

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getOrder = async (email, orderDate) => {
  console.log('getOrder');

  try {
    const { Items } = await dynamoDbClient.send(
      new QueryCommand({
        TableName: process.env.DB_TABLE_NAME,
        KeyConditionExpression: 'email = :email and orderDate = :orderDate',
        ExpressionAttributeValues: {
          ':email': { S: email },
          ':orderDate': { S: orderDate },
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

const getAllOrders = async () => {
  console.log('getOrders');

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
