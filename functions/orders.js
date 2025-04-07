const DBConnection = require('/opt/nodejs/services/dbservice')
const { GetCommand,UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const jwt = require('jsonwebtoken')

exports.OrdersLambda = async (event) => {
    const cookie = event.headers?.Cookie
    if (event.httpMethod === 'OPTIONS'){
        return corsheaders({
            statusCode: 200,
            body: ''
        })
    }
    const unauthorized = {
        statusCode:200,
        body:JSON.stringify({message:'unauthorized access'})
    }

    if(!cookie){
        console.log(' no cookie')
        return corsheaders(unauthorized)
    }
    const token = cookie.split('=')[0] == 'authToken' ? cookie.split('=')[1] : false;
    if(!token){
        console.log(' no token')
        return corsheaders(unauthorized)
    }
    const verifiedtoken = jwt.verify(token,"EnCoDeD-SeCrEt-KeY-256")
    const result = await DBConnection.send(
        new GetCommand({
            TableName: process.env.TableName,
            Key:{mail:verifiedtoken.mail}
        })
    )
    if( event.httpMethod === 'POST'){
        const {orderid} = JSON.parse(event.body)
        if(!orderid){
            console.log('no order id')
            return corsheaders(unauthorized)
        }
        if(result.Item){
            await DBConnection.send(
                new UpdateCommand({
                    TableName: process.env.UserDetailsTable,
                    Key:{user_id:result.Item.user_id},
                    UpdateExpression: "SET orders = list_append(orders,:v)",
                    ExpressionAttributeValues: {
                        ":v":[orderid]
                    },
                    ReturnValues: "UPDATED_NEW"
                })
            )
            return corsheaders({
                statusCode:200,
                body: JSON.stringify({message:'order added successfully'})
            })
        }
    }
    if( event.httpMethod === 'GET'){
        if(result.Item){
            const userdetails = await DBConnection.send(
                new GetCommand({
                    TableName: process.env.UserDetailsTable,
                    Key:{user_id:result.Item.user_id}
                })
            )
            if(userdetails.Item){
                return corsheaders({
                    statusCode: 200,
                    body: JSON.stringify({result:userdetails.Item.orders})
                })
            }
            return corsheaders(unauthorized)
        }
    }
}