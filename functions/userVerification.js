const jwt = require('jsonwebtoken')
const DBConnection = require('/opt/nodejs/services/dbservice')
const {GetCommand} = require('@aws-sdk/lib-dynamodb')
exports.UserVerificationLambda = async (event) => {
    console.log('request',event.queryStringParameters)
    const {token} = event.queryStringParameters
    if(!token)
        return {
            statusCode: 200,
            body: JSON.stringify({message:'unauthorized user'})
        }

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
                return {
                    statusCode:200,
                    body:JSON.stringify({message:'admin'})
                }

            else if(result.Item.verified){
                return {
                    statusCode:200,
                    body:JSON.stringify({message:'regular'})
                }
            }
            else{
                return {
                    statusCode:200,
                    body:JSON.stringify({message:'unverified'})
                }
            }
        }
    }
    return {
        statusCode:200,
        body:JSON.stringify({message:'unauthorized'})
    }
}