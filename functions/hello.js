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
    const cookie = event.headers?.Cookie
    if(!cookie){
        return {
            statusCode:200,
            body:JSON.stringify({message:'unauthorized access'})
        }
    }
    const token = cookie.split('=')[0] == 'authToken' ? cookie.split('=')[1] : false;
    if(token){
        const verification = await jwt.verify(token,"EnCoDeD-SeCrEt-KeY-256")
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
                return {
                    statusCode:200,
                    body:JSON.stringify({data:users.Items})
                }
            }
        }
    }

    return {
            statusCode:200,
            body:JSON.stringify({message:'unauthorized access'})
        }
}