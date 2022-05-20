import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient();

export { dynamoDbClient };
