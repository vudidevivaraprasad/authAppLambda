const { ScanCommand,GetCommand } = require('@aws-sdk/lib-dynamodb')
const DBConnection = require('/opt/nodejs/services/dbservice')
const {CreateTableCommand}  = require('@aws-sdk/client-dynamodb')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
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
exports.hellolambda4 = async (event,context) => {
    const result = await DBConnection.send(
        new CreateTableCommand({
            TableName:process.env.UserDetailsTable,
            AttributeDefinitions:[
                {
                    AttributeName:'user_id',
                    AttributeType:'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName:'user_id',
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
exports.hellolambda5 = async (event,context) => {
    const result = await DBConnection.send(
        new CreateTableCommand({
            TableName:process.env.OrdersTable,
            AttributeDefinitions:[
                {
                    AttributeName:'order_id',
                    AttributeType:'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName:'order_id',
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
exports.alluserdetails = async (event,context) => {
    const cookie = event.headers?.Cookie
    if (event.httpMethod === 'OPTIONS'){
        return corsheaders({
            statusCode: 200,
            body: ''
        })
    }
    if(!cookie){
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized access'})
        })
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
                        TableName:process.env.UserDetailsTable
                    })
                )
                return corsheaders({
                    statusCode:200,
                    body:JSON.stringify({data:users.Items})
                })
            }
        }
    }

    return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized access'})
        })
}
exports.allusers = async (event) => {
    const cookie = event.headers?.Cookie
    if (event.httpMethod === 'OPTIONS'){
        return corsheaders({
            statusCode: 200,
            body: ''
        })
    }
    if(!cookie){
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized access'})
        })
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
                return corsheaders({
                    statusCode:200,
                    body:JSON.stringify({data:users.Items})
                })
            }
        }
    }

    return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized access'})
        })
}

exports.hellolambda = async (event) => {
    const result = await DBConnection.send(
        new CreateTableCommand({
            TableName:process.env.ProductsTable,
            AttributeDefinitions:[
                {
                    AttributeName:'id',
                    AttributeType:'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName:'id',
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