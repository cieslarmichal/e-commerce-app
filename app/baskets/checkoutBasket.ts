import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, eventBridgeClient } from './shared';
import { StatusCodes } from 'http-status-codes';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { deleteBasketByEmail } from './deleteBasket';
import { getBasketByEmail } from './getBasket';

async function checkoutBasket(event: APIGatewayEvent): Promise<ProxyResult> {
  const basketProperties = JSON.parse(event.body as string);

  const basket = await getBasketByEmail(basketProperties.email);

  console.log('basketProperties', basketProperties);

  console.log('basket', basket);

  const checkoutPayload = await prepareOrderPayload(basketProperties, basket);

  console.log('checkout payload', checkoutPayload);

  await publishCheckoutBasketEvent(checkoutPayload);

  await deleteBasketByEmail(basketProperties.email);

  return {
    statusCode: StatusCodes.NO_CONTENT,
    body: '',
  };
}

const prepareOrderPayload = async (basketProperties: any, basket: any) => {
  if (!basket?.items) {
    throw new Error('Basket does not contain any items');
  }

  const totalPrice = basket.items.reduce(
    (previousItem: any, nextItem: any) =>
      previousItem.price * previousItem.quantity + nextItem.price * nextItem.quantity,
  );

  basketProperties.totalPrice = totalPrice;

  Object.assign(basketProperties, basket);

  console.log(basketProperties);

  return basketProperties;
};

const publishCheckoutBasketEvent = async (checkoutPayload: any) => {
  await eventBridgeClient.send(
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
};

export const handler = commonMiddleware(checkoutBasket);
