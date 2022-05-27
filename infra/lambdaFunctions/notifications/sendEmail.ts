import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class SendEmailLambda extends Construct {
  public readonly instance: NodejsFunction;

  constructor(scope: Construct) {
    super(scope, 'SendEmailLambdaFunction');

    this.instance = new NodejsFunction(this, 'SendEmailLambdaFunction', {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '/../../../app/notifications/controllers/sendEmail.ts'),
    });
  }
}
