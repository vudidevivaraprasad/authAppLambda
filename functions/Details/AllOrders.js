const DBConnection = require('/opt/nodejs/services/dbservice')
const { ScanCommand } = require('@aws-sdk/lib-dynamodb')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const userverification = require('/opt/nodejs/services/userverificationservice')


exports.AllOrdersLambda = async (event) => {
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

    const result = await userverification(token)
    console.log('user result',result)
    adminuser = result === "admin"?true:false
    console.log('adminuser',adminuser)
    
    if(adminuser){
        const ordersresult = await DBConnection.send(
            new ScanCommand({
                TableName: process.env.OrdersTable
            })
        )
        if(ordersresult.Items){
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({result:ordersresult.Items})
            })
        }
    }
    else{
        return corsheaders(unauthorized)
    }
}