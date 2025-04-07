const DBConnection = require('/opt/nodejs/services/dbservice')
const encryption = require('/opt/nodejs/utilities/bcrypt')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const jwt = require('jsonwebtoken')
const {GetCommand,UpdateCommand}  = require('@aws-sdk/lib-dynamodb')
exports.forgetpasswordlambda = async (event) => {
    try{
        if (event.httpMethod === 'OPTIONS'){
            return corsheaders({
                statusCode: 200,
                body: ''
            })
        }
        let {newpassword,token} = JSON.parse(event.body)
        const user = jwt.verify(token,"EnCoDeD-SeCrEt-KeY-256")
        const userfound = await DBConnection.send(
            new GetCommand({
                    TableName:process.env.TableName,
                    Key:{mail:user.mail}
                })
            )
        if(userfound){
            const encryptedpassword = await encryption(newpassword)
            const result  = await DBConnection.send(
                new UpdateCommand({
                    TableName:process.env.TableName,
                    Key:{mail:userfound.Item.mail},
                    UpdateExpression:"SET password = :newpassword",
                    ExpressionAttributeValues:{
                        ":newpassword" : encryptedpassword
                    }
                })
            )
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({message:'password updated successfully'})
            })
        }
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized user'})
        })
    }
    catch{
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized user'})
        })
    }

}