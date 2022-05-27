import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class SendOrderCreatedEmailLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct) {
    super(scope, 'SendOrderCreatedEmailLambdaFunction');

    this.instance = new NodejsFunction(this, 'SendOrderCreatedEmailLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../app/notifications/controllers/sendOrderCreatedEmail.ts'),
    });
  }
}
