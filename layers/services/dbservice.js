const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const client = new DynamoDBClient();
const DBConnection = DynamoDBDocumentClient.from(client)
module.exports = DBConnection;