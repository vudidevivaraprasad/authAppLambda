const DBConnection = require('/opt/nodejs/services/dbservice')
const { GetCommand,UpdateCommand,PutCommand } = require('@aws-sdk/lib-dynamodb')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const jwt = require('jsonwebtoken')
const { v4: uuidv4, v4 } = require('uuid');


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
    if(!result.Item){
        return corsheaders(unauthorized)
    }
    if( event.httpMethod === 'POST'){

        const {address,amount,quantity,products} = JSON.parse(event.body)
        if(!address|| !amount || !quantity|| !products){
            console.log('no address,amount,quantity,products')
            return corsheaders(unauthorized)
        }
        if(result.Item){
            if(amount.length === quantity.length === products.length){
                return corsheaders({
                    statusCode:200,
                    body: JSON.stringify({message:'amount,quantity,products length is not matching'})
                })
            }
            let productinfo = []
            products.map((product,index) => {
                productinfo.push({
                    product_id:product,
                    amount:amount[index],
                    quantity:quantity[index]
                })
            })
            const orderinfo = {
                order_id:v4(),
                products:productinfo,
                Date:Date.now(),
                status:'pending'
            }
            const orderresult = await DBConnection.send(
                new PutCommand({
                    TableName: process.env.OrdersTable,
                    Item:orderinfo
                })
            )
            console.log('order table result',orderresult)
            const userresult = await DBConnection.send(
                new UpdateCommand({
                    TableName: process.env.UserDetailsTable,
                    Key:{user_id:result.Item.user_id},
                    UpdateExpression: "SET orders = list_append(orders,:v)",
                    ExpressionAttributeValues: {
                        ":v":[orderinfo.order_id]
                    },
                    ReturnValues: "UPDATED_NEW"
                })
            )
            console.log('user details result',userresult)
            return corsheaders({
                statusCode:200,
                body: JSON.stringify({message:'order added successfully'})
            })
        }
    }

    if( event.httpMethod === 'GET'){
        if(result.Item){
            let orderdetailsresult = []
            const userdetails = await DBConnection.send(
                new GetCommand({
                    TableName: process.env.UserDetailsTable,
                    Key:{user_id:result.Item.user_id}
                })
            )
            if(userdetails.Item.orders.length === 0){
                return corsheaders({
                    statusCode: 200,
                    body: JSON.stringify({result:[]})
                })
            }
            console.log('userdetails',userdetails.Item)
            const promises = userdetails.Item.orders.map(order => {
                return DBConnection.send(
                    new GetCommand({
                        TableName: process.env.OrdersTable,
                        Key:{order_id:order}
                    })
                )
            })
            const promisesresult = await Promise.all(promises)
            console.log('promises result',promisesresult)
            orderdetailsresult = promisesresult.map(order => order.Item)
            console.log('orderdetails result',orderdetailsresult)
            if(userdetails.Item){
                return corsheaders({
                    statusCode: 200,
                    body: JSON.stringify({result:orderdetailsresult})
                })
            }
            return corsheaders(unauthorized)
        }
    }
}