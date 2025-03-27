const jwt = require('jsonwebtoken')
const DBConnection = require('./services/dbservice')
const {GetCommand,UpdateCommand} = require('@aws-sdk/lib-dynamodb')
exports.verificationlambda = async (event) => {
    const {token} = event.queryStringParameters;
    try{
        const verifiedtoken = jwt.verify(token,"EnCoDeD-SeCrEt-KeY-256")
        console.log("verificationtoken",verifiedtoken)
        console.log("mail",verifiedtoken.mail)
        const user = await DBConnection.send(
            new GetCommand({
                TableName:'AuthTable',
                Key:{mail:verifiedtoken.mail}
            })
        )
        if(user){
            // console.log(user)
            // console.log(user.Item)
            if(user.Item.verified)
                return {
                    statusCode:200,
                    body:JSON.stringify({message:'already verified'})
                }
            const result = await DBConnection.send(
                new UpdateCommand({
                    TableName:'AuthTable',
                    Key:{mail:user.Item.mail},
                    UpdateExpression: "SET verified = :v",
                    ExpressionAttributeValues: {
                        ":v":true
                    },
                    ReturnValues: "UPDATED_NEW"
                })
            )
            return {
                statusCode:200,
                body:JSON.stringify({message:'verified',data:result})
            }
        }
        else
            return {
                statusCode:200,
                body:JSON.stringify({message:'invalid token'})
            }
    }
    catch(error){
        return {
            statusCode:200,
            body:JSON.stringify({message:'token expired'})
        }
    }
}