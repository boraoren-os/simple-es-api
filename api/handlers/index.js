"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require('aws-sdk');
const event_aggregator_1 = require("./lib/event-aggregator");
const ddb = new AWS.DynamoDB.DocumentClient();
module.exports.aggregator = async (event) => {
    console.log({ event: JSON.stringify(event, null, 4) });
    for (let record of event.Records) {
        if (record.dynamodb) {
            const apiEvent = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
            await event_aggregator_1.processEvent(apiEvent);
        }
    }
};
module.exports.create = async function createEvent(event) {
    const eventModel = JSON.parse(event.body);
    try {
        await validateModel(eventModel);
    }
    catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 400,
            headers: { 'content-type': 'text/plain' },
            body: err.message
        };
    }
    try {
        const updatedEventModel = await saveEvent(eventModel);
        return {
            statusCode: 200,
            body: JSON.stringify(updatedEventModel)
        };
    }
    catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 500,
            headers: { 'content-type': 'text/plain' },
            body: 'An error occurred while trying to save your event. Please try again later.'
        };
    }
};
async function validateModel(eventModel) {
    if (!eventModel.eventId) {
        throw new Error("Please provide an 'eventId' on your event.");
    }
    if (!eventModel.type) {
        throw new Error("Please provide a 'type' on your event.");
    }
    // additional validations will go here.
}
async function saveEvent(eventModel) {
    const timestamp = new Date().toISOString();
    const newModel = { timestamp, ...eventModel };
    await ddb.putItem({ TableName: process.env.TABLE_NAME, Item: newModel }).promise();
    return newModel;
}
module.exports.get = async function echoHandlerCode(event, _, callback) {
    return callback(undefined, {
        isBase64Encoded: false,
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...event, TABLE_NAME: process.env.TABLE_NAME })
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQiw2REFBc0Q7QUFFdEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRTlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEtBQUssRUFBRSxLQUEwQixFQUFFLEVBQUU7SUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELEtBQUssSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtRQUM5QixJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFFakIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0UsTUFBTSwrQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2hDO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLFVBQVUsV0FBVyxDQUFDLEtBQVU7SUFFekQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsSUFBSTtRQUNBLE1BQU0sYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ25DO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPO1lBQ0gsZUFBZSxFQUFFLEtBQUs7WUFDdEIsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFO1lBQ3pDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTztTQUNwQixDQUFBO0tBQ0o7SUFFRCxJQUFJO1FBQ0EsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxPQUFPO1lBQ0gsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztTQUMxQyxDQUFBO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU87WUFDSCxlQUFlLEVBQUUsS0FBSztZQUN0QixVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUU7WUFDekMsSUFBSSxFQUFFLDRFQUE0RTtTQUNyRixDQUFBO0tBQ0o7QUFHTCxDQUFDLENBQUE7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUFDLFVBQWtCO0lBQzNDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztLQUNqRTtJQUVELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO1FBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztLQUM3RDtJQUNELHVDQUF1QztBQUMzQyxDQUFDO0FBRUQsS0FBSyxVQUFVLFNBQVMsQ0FBQyxVQUFrQjtJQUN2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzNDLE1BQU0sUUFBUSxHQUFHLEVBQUUsU0FBUyxFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUM7SUFDOUMsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25GLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxLQUFLLFVBQVUsZUFBZSxDQUFDLEtBQVUsRUFBRSxDQUFNLEVBQUUsUUFBYTtJQUNqRixPQUFPLFFBQVEsQ0FBQyxTQUFTLEVBQUU7UUFDdkIsZUFBZSxFQUFFLEtBQUs7UUFDdEIsVUFBVSxFQUFFLEdBQUc7UUFDZixPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7UUFDL0MsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUN6RSxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNvbnN0IEFXUyA9IHJlcXVpcmUoJ2F3cy1zZGsnKTtcbmltcG9ydCB7IHByb2Nlc3NFdmVudCB9IGZyb20gJy4vbGliL2V2ZW50LWFnZ3JlZ2F0b3InO1xuaW1wb3J0IHsgRHluYW1vREJTdHJlYW1FdmVudCB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5jb25zdCBkZGIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbm1vZHVsZS5leHBvcnRzLmFnZ3JlZ2F0b3IgPSBhc3luYyAoZXZlbnQ6IER5bmFtb0RCU3RyZWFtRXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmxvZyh7IGV2ZW50OiBKU09OLnN0cmluZ2lmeShldmVudCwgbnVsbCwgNCkgfSk7XG4gICAgZm9yIChsZXQgcmVjb3JkIG9mIGV2ZW50LlJlY29yZHMpIHtcbiAgICAgICAgaWYgKHJlY29yZC5keW5hbW9kYikge1xuXG4gICAgICAgICAgICBjb25zdCBhcGlFdmVudCA9IEFXUy5EeW5hbW9EQi5Db252ZXJ0ZXIudW5tYXJzaGFsbChyZWNvcmQuZHluYW1vZGIuTmV3SW1hZ2UpO1xuICAgICAgICAgICAgYXdhaXQgcHJvY2Vzc0V2ZW50KGFwaUV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gYXN5bmMgZnVuY3Rpb24gY3JlYXRlRXZlbnQoZXZlbnQ6IGFueSkge1xuXG4gICAgY29uc3QgZXZlbnRNb2RlbCA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSk7XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdmFsaWRhdGVNb2RlbChldmVudE1vZGVsKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlzQmFzZTY0RW5jb2RlZDogZmFsc2UsXG4gICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAndGV4dC9wbGFpbicgfSxcbiAgICAgICAgICAgIGJvZHk6IGVyci5tZXNzYWdlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB1cGRhdGVkRXZlbnRNb2RlbCA9IGF3YWl0IHNhdmVFdmVudChldmVudE1vZGVsKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRFdmVudE1vZGVsKVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc0Jhc2U2NEVuY29kZWQ6IGZhbHNlLFxuICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ3RleHQvcGxhaW4nIH0sXG4gICAgICAgICAgICBib2R5OiAnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgdHJ5aW5nIHRvIHNhdmUgeW91ciBldmVudC4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nXG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuXG5hc3luYyBmdW5jdGlvbiB2YWxpZGF0ZU1vZGVsKGV2ZW50TW9kZWw6IElFdmVudCkge1xuICAgIGlmICghZXZlbnRNb2RlbC5ldmVudElkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsZWFzZSBwcm92aWRlIGFuICdldmVudElkJyBvbiB5b3VyIGV2ZW50LlwiKTtcbiAgICB9XG5cbiAgICBpZiAoIWV2ZW50TW9kZWwudHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgcHJvdmlkZSBhICd0eXBlJyBvbiB5b3VyIGV2ZW50LlwiKTtcbiAgICB9XG4gICAgLy8gYWRkaXRpb25hbCB2YWxpZGF0aW9ucyB3aWxsIGdvIGhlcmUuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVFdmVudChldmVudE1vZGVsOiBJRXZlbnQpIHtcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gICAgY29uc3QgbmV3TW9kZWwgPSB7IHRpbWVzdGFtcCwgLi4uZXZlbnRNb2RlbCB9O1xuICAgIGF3YWl0IGRkYi5wdXRJdGVtKHsgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5UQUJMRV9OQU1FLCBJdGVtOiBuZXdNb2RlbCB9KS5wcm9taXNlKCk7XG4gICAgcmV0dXJuIG5ld01vZGVsO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBhc3luYyBmdW5jdGlvbiBlY2hvSGFuZGxlckNvZGUoZXZlbnQ6IGFueSwgXzogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHVuZGVmaW5lZCwge1xuICAgICAgICBpc0Jhc2U2NEVuY29kZWQ6IGZhbHNlLFxuICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IC4uLmV2ZW50LCBUQUJMRV9OQU1FOiBwcm9jZXNzLmVudi5UQUJMRV9OQU1FIH0pXG4gICAgfSk7XG59XG5cbmludGVyZmFjZSBJRXZlbnQge1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBldmVudElkOiBzdHJpbmc7XG59Il19