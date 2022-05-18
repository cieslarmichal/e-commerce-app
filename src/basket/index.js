import { GetItemCommand, ScanCommand, PutItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDbClient } from './dynamoDbClient';
import { eventBridgeClient } from './eventBridgeClient';

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
        const basketProperties = JSON.parse(event.body);

        if (event.path === '/basket/checkout') {
          body = await checkoutBasket(basketProperties);
        } else {
          body = await createBasket(basketProperties);
        }

        break;
      }
      case 'DELETE': {
        const email = event.pathParameters.email;

        body = await deleteBasket(email);

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

const checkoutBasket = async (basketProperties) => {
  console.log('checkoutBasket');

  if (!basketProperties?.email) {
    throw new Error('Email not provided');
  }

  const basket = await getBasket(basketProperties.email);

  const checkoutPayload = prepareOrderPayload(basketProperties, basket);

  await publishCheckoutBasketEvent(checkoutPayload);

  await deleteBasket(basketProperties.email);
};

const prepareOrderPayload = async (basketProperties, basket) => {
  console.log('prepareOrderPayload');

  try {
    if (!basket?.items) {
      throw new Error('Basket does not contain any items');
    }

    const totalPrice = basket.items.reduce((previousItem, nextItem) => previousItem.price + nextItem.price);

    basketProperties.totalPrice = totalPrice;

    console.log(basketProperties);

    Object.assign(basketProperties, basket);

    console.log(basketProperties);

    return basketProperties;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const publishCheckoutBasketEvent = async (checkoutPayload) => {
  console.log('publishCheckoutBasketEvent', checkoutPayload);

  try {
    const data = await eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: process.env.EVENT_SOURCE,
            Detail: JSON.stringify(checkoutPayload),
            DetailType: process.env.EVENT_DETAIL_TYPE,
            Resources: [],
            EventBusName: process.env.EVENT_BUS_NAME,
          },
        ],
      }),
    );

    console.log(data);

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
