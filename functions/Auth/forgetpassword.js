const DBConnection = require('/opt/nodejs/services/dbservice')
const encryption = require('/opt/nodejs/utilities/bcrypt')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const jwtgenerator = require('/opt/nodejs/utilities/jwtGenerator')
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
        console.log("event",JSON.parse(event.body))
        let {newpassword,token,mail} = JSON.parse(event.body)
        if(newpassword && token){
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
        if(mail || mail==''){
            if(!mail){
                return corsheaders({
                    statusCode:200,
                    body:JSON.stringify({message:'mail is required'})
                })
            }
            const user = await DBConnection.send(
                new GetCommand({
                    TableName:process.env.TableName,
                    Key:{mail:mail}
                })
            )
            if(!user.Item){
                return corsheaders({
                    statusCode:200,
                    body:JSON.stringify({message:'user not found'})
                })
            }
            const token = await jwtgenerator({mail:mail})
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({token:token})
            })
        }
    }
    catch{
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'unauthorized user'})
        })
    }

}