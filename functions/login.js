const bcryption = require('bcryptjs')
const DBConnection = require('/opt/nodejs/services/dbservice')
const jwt = require('/opt/nodejs/utilities/jwtGenerator')
const {GetCommand} = require('@aws-sdk/lib-dynamodb')
exports.loginlambda = async (event,context) => {
    try{

        const {mail,password} = JSON.parse(event.body);
    
        if(!mail || !password)
            return {
                statusCode:200,
                body:JSON.stringify({message:'mail and password is required'})
            }
        
        const result = await DBConnection.send(
            new GetCommand({
                TableName:process.env.TableName,
                Key:{mail}
            })
        )
    
        if(!result.Item)
            return {
                statusCode:200,
                body:JSON.stringify({message:'mail or password is incorrect'})
            }
        
        if(!result.Item.verified)
            return {
                statusCode:200,
                body:JSON.stringify({message:'user is not verified'})
            }
        
        const passwordverification = await bcryption.compare(password,result.Item.password)
        if(passwordverification){
            const token = await jwt({mail:result.Item.mail},'7d')
            return {
                statusCode:200,
                headers: {
                    "Set-Cookie": `authToken=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=None;`
                    // "Set-Cookie": `authToken=${token}; Path=/; Max-Age=604800; HttpOnly;`
                },
                body:JSON.stringify({message:'login successful'})
            }
        }
    
        return {
            statusCode:200,
            body:JSON.stringify({message:'mail or password is incorrect'})
        }
    }
    catch{
        return {
            statusCode:200,
            body: JSON.stringify({message:'an unexpected error occured'})
        }
    }
}