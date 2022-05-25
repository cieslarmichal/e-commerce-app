import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { commonMiddleware, dynamoDbClient } from '../shared';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { StatusCodes } from 'http-status-codes';

async function getOrders(event: APIGatewayEvent): Promise<ProxyResult> {
  // const { email } = event.queryStringParameters;

  // body = await getOrder(email, orderDate);
  const body = await getAllOrders();

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      data: body,
    }),
  };
}

// const getOrder = async (email: string, orderDate: string) => {
//   console.log('getOrder');

//   const { Items } = await dynamoDbClient.send(
//     new QueryCommand({
//       TableName: process.env.DB_TABLE_NAME,
//       KeyConditionExpression: 'email = :email and orderDate = :orderDate',
//       ExpressionAttributeValues: {
//         ':email': { S: email },
//         ':orderDate': { S: orderDate },
//       },
//     }),
//   );
//   console.log(Items);

//   return Items ? Items.map((item) => unmarshall(item)) : {};
// };

const getAllOrders = async () => {
  console.log('getOrders');

  const { Items } = await dynamoDbClient.send(
    new ScanCommand({
      TableName: process.env.DB_TABLE_NAME,
    }),
  );

  console.log(Items);

  return Items ? Items.map((item) => unmarshall(item)) : {};
};

export const handler = commonMiddleware(getOrders);
