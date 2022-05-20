import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class BasketsTable extends Construct {
  public readonly instance: ITable;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.instance = new Table(this, 'BasketsTable', {
      partitionKey: {
        name: 'email',
        type: AttributeType.STRING,
      },
      tableName: 'baskets',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}