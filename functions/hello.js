const { ScanCommand,GetCommand } = require('@aws-sdk/lib-dynamodb')
const DBConnection = require('/opt/nodejs/services/dbservice')
const {CreateTableCommand}  = require('@aws-sdk/client-dynamodb')
const jwt = require('jsonwebtoken')

exports.hellolambda3 = async (event,context) => {
    const result = await DBConnection.send(
        new CreateTableCommand({
            TableName:process.env.TableName,
            AttributeDefinitions:[
                {
                    AttributeName:'mail',
                    AttributeType:'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName:'mail',
                    KeyType:'HASH'
                }
            ],
            ProvisionedThroughput:{
                ReadCapacityUnits:1,
                WriteCapacityUnits:1
            }
        })
    )
    console.log('result',result)
    return {
        statusCode:200,
        body:JSON.stringify({message:"table created"})
    }
}
exports.allusers = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        console.log('inside options')
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:4200", // Allow Angular frontend
            "Access-Control-Allow-Credentials": "true", // Required for cookies
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
          body: ""
        };
    }
    const responseHeaders = {
        "Access-Control-Allow-Origin": "http://localhost:4200",
        "Access-Control-Allow-Credentials": "true",
    };
    // console.log('headers',event.headers)
    const cookie = event.headers?.Cookie
    // console.log('authToken',cookie)
    if(!cookie){
        return {
            statusCode:200,
            headers:responseHeaders,
            body:JSON.stringify({message:'unauthorized access'})
        }
    }
    const token = cookie.split('=')[0] == 'authToken' ? cookie.split('=')[1] : false;
    if(token){
        const verification = await jwt.verify(token,"EnCoDeD-SeCrEt-KeY-256")
        // console.log('verification',verification)
        // console.log('user',verification?.mail)
        if(verification?.mail){
            const user = await DBConnection.send(
                            new GetCommand({
                                TableName: process.env.TableName,
                                Key:{mail:verification.mail}
                            })
                        )
            if(user.Item){
                const users = await DBConnection.send(
                    new ScanCommand({
                        TableName:process.env.TableName
                    })
                )
                // console.log("users",users)
                return {
                    statusCode:200,
                    headers:responseHeaders,
                    body:JSON.stringify({data:users.Items})
                }
            }
        }
    }

    return {
            statusCode:200,
            headers:responseHeaders,
            body:JSON.stringify({message:'unauthorized access'})
        }
}