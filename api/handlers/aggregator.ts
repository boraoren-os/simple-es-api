import {PrimaryKey} from "./lib/primaryKey";
import {APIEvent, EventAggregator} from './lib/event-aggregator';
import {DynamoDBStreamEvent} from "aws-lambda";
import {eventHandlers} from "./lib/events/index";

const AWS = require('aws-sdk');

const primaryKeyDefinition: PrimaryKey = {partitionKey: process.env.PARTITION_KEY!, sortKey: process.env.SORT_KEY!};

let documentClient = new AWS.DynamoDB.DocumentClient();

const eventAggregator = new EventAggregator(primaryKeyDefinition, {
    aggregatorName: process.env.AGGREGATOR_NAME!,
    tableName: process.env.TABLE_NAME!
}, {
    documentClient,
    eventHandlers
});

export async function handler(event: DynamoDBStreamEvent) {
    console.log({event: JSON.stringify(event, null, 4)});
    for (let record of event.Records) {
        if (record.eventName === "REMOVE") {
            continue;
        }
        if (record.dynamodb) {
            const apiEvent: APIEvent = <APIEvent>AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage!);
            if (!(apiEvent[primaryKeyDefinition.sortKey] as string).startsWith('event_')) {
                console.log('This is not an avent');
                continue;
            }
            await eventAggregator.process(apiEvent);
        }
    }
}

