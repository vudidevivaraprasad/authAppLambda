const jwt = require('jsonwebtoken')
const DBConnection = require('/opt/nodejs/services/dbservice')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const {GetCommand} = require('@aws-sdk/lib-dynamodb')
exports.UserVerificationLambda = async (event) => {
    const {token} = event.queryStringParameters
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
    return corsheaders({
        statusCode:200,
        body:JSON.stringify({message:'unauthorized'})
    })
}