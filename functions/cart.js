const DBConnection = require('/opt/nodejs/services/dbservice')
const { GetCommand,UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const jwt = require('jsonwebtoken')

exports.CartLambda = async (event) => {
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
        const {productid,task} = JSON.parse(event.body)
        if(!productid || !task){
            console.log('no product or task')
            return corsheaders(unauthorized)
        }
        if(result.Item){
            if(task === 'ADD'){
                await DBConnection.send(
                    new UpdateCommand({
                        TableName: process.env.UserDetailsTable,
                        Key:{user_id:result.Item.user_id},
                        UpdateExpression: "SET cart = list_append(cart,:v)",
                        ExpressionAttributeValues: {
                            ":v":[productid]
                        },
                        ReturnValues: "UPDATED_NEW"
                    })
                )
                return corsheaders({
                    statusCode:200,
                    body: JSON.stringify({message:'product added successfully'})
                })
            }
            else if(task === 'REMOVE'){
                const userdetails = await DBConnection.send(
                    new GetCommand({
                        TableName: process.env.UserDetailsTable,
                        Key:{user_id:result.Item.user_id}
                    })
                )
                const updatedcart = userdetails.Item.cart.filter(item => item != productid)
                await DBConnection.send(
                    new UpdateCommand({
                        TableName: process.env.UserDetailsTable,
                        Key:{user_id:result.Item.user_id},
                        UpdateExpression:"SET cart = :v",
                        ExpressionAttributeValues: {
                            ":v":updatedcart
                        },
                        ReturnValues: "UPDATED_NEW"
                    })
                )
                return corsheaders({
                    statusCode: 200,
                    body: JSON.stringify({message:'product removed successfully'})
                })
            }
            else{
                console.log('miss match task')
                return corsheaders(unauthorized)
            }
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
                    body: JSON.stringify({result:userdetails.Item.cart})
                })
            }
            console.log(' unknown match')
            return corsheaders(unauthorized)
        }
    }
}