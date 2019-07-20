
const AWS = require('aws-sdk');
import { processEvent } from './lib/event-aggregator';
import { DynamoDBStreamEvent } from "aws-lambda";
import upperCase = require('upper-case');
const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.aggregator = async (event: DynamoDBStreamEvent) => {
    console.log({ event: JSON.stringify(event, null, 4) });
    for (let record of event.Records) {
        if (record.dynamodb) {

            const apiEvent = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
            await processEvent(apiEvent);
        }
    }
}

module.exports.create = async function createEvent(event: any) {

    const eventModel = JSON.parse(event.body);
    try {
        await validateModel(eventModel);
    } catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 400,
            headers: { 'content-type': 'text/plain' },
            body: err.message
        }
    }

    try {
        const updatedEventModel = await saveEvent(eventModel);
        return {
            statusCode: 200,
            body: JSON.stringify(updatedEventModel)
        }
    } catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 500,
            headers: { 'content-type': 'text/plain' },
            body: 'An error occurred while trying to save your event. Please try again later.'
        }
    }


}

async function validateModel(eventModel: IEvent) {
    if (!eventModel.eventId) {
        throw new Error("Please provide an 'eventId' on your event.");
    }

    if (!eventModel.type) {
        throw new Error("Please provide a 'type' on your event.");
    }
    // additional validations will go here.
}

async function saveEvent(eventModel: IEvent) {
    const timestamp = new Date().toISOString();
    const newModel = { timestamp, ...eventModel };
    await ddb.put({ TableName: process.env.TABLE_NAME, Item: newModel }).promise();
    return newModel;
}

module.exports.get = async function echoHandlerCode(event: any) {
    const [_, aggregate, id] = event.path.split("/");
    
    const model = await getModel(aggregate, id);
    
    return {
        isBase64Encoded: false,
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(model)
    };
}

async function getModel(aggregate: string, id: string){
    const results = await ddb.get({TableName: process.env[`TABLE_NAME_${upperCase(aggregate)}`], Key: {id}}).promise();
    return results.Item;
}

interface IEvent {
    type: string;
    eventId: string;
}