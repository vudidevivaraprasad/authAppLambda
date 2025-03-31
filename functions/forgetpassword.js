const DBConnection = require('/opt/nodejs/services/dbservice')
const encryption = require('/opt/nodejs/utilities/bcrypt')
const jwt = require('jsonwebtoken')
const {GetCommand,UpdateCommand}  = require('@aws-sdk/lib-dynamodb')
exports.forgetpasswordlambda = async (event) => {
    try{
        let {newpassword,token} = JSON.parse(event.body)
        console.log("newpassword",newpassword,"token",token)
        const user = jwt.verify(token,"EnCoDeD-SeCrEt-KeY-256")
        console.log("user",user)
        const userfound = await DBConnection.send(
            new GetCommand({
                    TableName:process.env.TableName,
                    Key:{mail:user.mail}
                })
            )
        console.log('user found',userfound)
        if(userfound){
            console.log('inside user found')
            const encryptedpassword = await encryption(newpassword)
            console.log('encryptedpassword',encryptedpassword)
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
            console.log('result',result)
            return {
                statusCode:200,
                body:JSON.stringify({message:'password updated successfully'})
            }
        }
        return {
            statusCode:200,
            body:JSON.stringify({message:'unauthorized user'})
        }
    }
    catch{
        console.log('catch error')
        return {
            statusCode:200,
            body:JSON.stringify({message:'unauthorized user'})
        }
    }

}