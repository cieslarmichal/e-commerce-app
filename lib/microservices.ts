import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface MicroservicesProperties {
  readonly productTableName: string;
}

export class Microservices extends Construct {
  public readonly productMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, properties: MicroservicesProperties) {
    super(scope, id);

    this.productMicroservice = new NodejsFunction(this, 'productLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRIMARY_KEY: 'id',
        DB_TABLE_NAME: properties.productTableName,
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../src/product/index.js'),
    });
  }
}
