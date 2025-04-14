const jwt = require('jsonwebtoken')
const DBConnection = require('/opt/nodejs/services/dbservice')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const {GetCommand} = require('@aws-sdk/lib-dynamodb')
exports.UserVerificationLambda = async (event) => {
    try{
        let token;
        let cookie;
        if(event.queryStringParameters?.token){
            console.log('query log')
            token = event.queryStringParameters.token
        }
        else{
            console.log('cookie log')
            cookie = event.headers?.Cookie
            if(!cookie){
                console.log(' no cookie')
                return corsheaders({
                    statusCode: 200,
                    body: JSON.stringify({message:'unauthorized user'})
                })
            }
            token = cookie.split('=')[0] == 'authToken' ? cookie.split('=')[1] : false;
        }
        if (event.httpMethod === 'OPTIONS'){
            return corsheaders({
                statusCode: 200,
                body: ''
            })
        }
        if(!token)
            return corsheaders({
                statusCode: 200,
                body: JSON.stringify({message:'unauthorized user'})
            })
    
        const user = jwt.verify(token,"EnCoDeD-SeCrEt-KeY-256")
        if(user){
            const result = await DBConnection.send(
                new GetCommand({
                    TableName: process.env.TableName,
                    Key:{mail:user.mail}
                })
            )
            if(result.Item){
                if(result.Item.admin)
                    return corsheaders({
                        statusCode:200,
                        body:JSON.stringify({message:'admin'})
                    })
    
                else if(result.Item.verified){
                    return corsheaders({
                        statusCode:200,
                        body:JSON.stringify({message:'regular'})
                    })
                }
                else{
                    return corsheaders({
                        statusCode:200,
                        body:JSON.stringify({message:'unverified'})
                    })
                }
            }
        }
    }
    catch{
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized'})
        })
    }
}