const DBConnection = require('/opt/nodejs/services/dbservice')
const { GetCommand,UpdateCommand } = require('@aws-sdk/lib-dynamodb')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const jwt = require('jsonwebtoken')

exports.AddressLambda = async (event) => {
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
        const {task} = JSON.parse(event.body)
        if(!task){
            console.log('no address or task')
            return corsheaders(unauthorized)
        }
        if(result.Item){
            if(task === 'ADD'){
                const {id,name,mobilenumber,pincode,state,city,village,area} = JSON.parse(event.body)
                if(!name || !mobilenumber || !pincode || !state || !city || !village || !area){
                    console.log('no address or task')
                    return corsheaders(unauthorized)
                }
                const address = {id,name,mobilenumber,pincode,state,city,village,area}
                await DBConnection.send(
                    new UpdateCommand({
                        TableName: process.env.UserDetailsTable,
                        Key:{user_id:result.Item.user_id},
                        UpdateExpression: "SET address = list_append(address,:v)",
                        ExpressionAttributeValues: {
                            ":v":[address]
                        },
                        ReturnValues: "UPDATED_NEW"
                    })
                )
                return corsheaders({
                    statusCode:200,
                    body: JSON.stringify({message:'address added successfully'})
                })
            }
            else if(task === 'REMOVE'){
                const {id} = JSON.parse(event.body)
                if(!id){
                    return corsheaders(unauthorized)
                }
                const userdetails = await DBConnection.send(
                    new GetCommand({
                        TableName: process.env.UserDetailsTable,
                        Key:{user_id:result.Item.user_id}
                    })
                )
                const updatedaddress = userdetails.Item.address.filter(item => item.id != id)
                await DBConnection.send(
                    new UpdateCommand({
                        TableName: process.env.UserDetailsTable,
                        Key:{user_id:result.Item.user_id},
                        UpdateExpression:"SET address = :v",
                        ExpressionAttributeValues: {
                            ":v":updatedaddress
                        },
                        ReturnValues: "UPDATED_NEW"
                    })
                )
                return corsheaders({
                    statusCode: 200,
                    body: JSON.stringify({message:'address removed successfully'})
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
                    body: JSON.stringify({result:userdetails.Item.address})
                })
            }
            console.log(' unknown match')
            return corsheaders(unauthorized)
        }
    }
}