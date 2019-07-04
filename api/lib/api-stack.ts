import cdk = require('@aws-cdk/core');
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code, StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
export interface ApiStackProps extends cdk.StackProps {
  buildAPIGateway: boolean;
  aggregators: string[];
}

export class ApiStack extends cdk.Stack {
  eventsTable: Table;
  aggregateTables: Table[];

  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { buildAPIGateway, aggregators } = props;

    this.buildDatabase();
    this.buildAggregators(aggregators);
    if (buildAPIGateway) {
      this.buildAPIGateway();
    }
  }

  buildAPIGateway() {

  }

  buildDatabase() {
    this.eventsTable = new Table(this, 'events-table', {
      partitionKey: { name: 'eventId', type: AttributeType.STRING },
      sortKey: { name: 'timestamp', type: AttributeType.STRING }
    });
  }

  buildAggregators(aggregators: string[]) {
    this.aggregateTables = [];
    for (let aggregator of aggregators) {
      const aggregateTable = new Table(this, `${aggregator}-view-table`, {
        partitionKey: { name: 'id', type: AttributeType.STRING },
        billingMode: BillingMode.PROVISIONED,
        readCapacity: 3,
        writeCapacity: 3
      });
      const aggregateLambda = new Function(this, `${aggregator}-processor`, {
        environment: {
          TABLE_NAME: aggregateTable.tableName
        },
        handler: 'index.aggregator',
        runtime: Runtime.NODEJS_10_X,
        code: Code.asset('handlers')
      });
      aggregateLambda.addEventSource(new DynamoEventSource(aggregateTable, { startingPosition: StartingPosition.LATEST }));
      this.aggregateTables.push(aggregateTable);
    }
  }
}
