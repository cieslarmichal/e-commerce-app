import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class Database extends Construct {
  public readonly productsTable: ITable;
  public readonly basketsTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.productsTable = this.createProductsTable();

    this.basketsTable = this.createBasketsTable();
  }

  createProductsTable() {
    return new Table(this, 'products', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'products',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }

  createBasketsTable() {
    return new Table(this, 'baskets', {
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
