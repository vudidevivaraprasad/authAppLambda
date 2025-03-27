const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const client = new DynamoDBClient({
    region: 'us-east-1',
    endpoint: 'http://host.docker.internal:8000',
    credentials: {
        accessKeyId: 'AKIASDR',
        secretAccessKey: 'Z9kApkTpZPX1q1'
    }
});
const DBConnection = DynamoDBDocumentClient.from(client)
module.exports = DBConnection;