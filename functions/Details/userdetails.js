const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const jwt = require('jsonwebtoken')
const DBConnection = require('/opt/nodejs/services/dbservice')
const {GetCommand,ScanCommand} = require('@aws-sdk/lib-dynamodb')

exports.UserDetails = async (event,context) => {
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
                    new GetCommand({
                        TableName:process.env.UserDetailsTable,
                        Key:{user_id:user.Item.user_id}
                    })
                )
                return corsheaders({
                    statusCode:200,
                    body:JSON.stringify({data:users.Item})  
                })
            }
        }
    }

    return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized access'})
        })
}