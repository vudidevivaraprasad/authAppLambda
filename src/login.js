const bcryption = require('bcryptjs')
const DBConnection = require('./services/dbservice')
const jwt = require('./utilities/jwtGenerator')
const {GetCommand} = require('@aws-sdk/lib-dynamodb')
exports.loginlambda = async (event,context) => {
    const {mail,password} = JSON.parse(event.body);
    if(!mail || !password)
        return {
            statusCode:200,
            body:JSON.stringify({message:'mail and password is required'})
        }
    
    const result = await DBConnection.send(
        new GetCommand({
            TableName:'AuthTable',
            Key:{mail}
        })
    )
    if(!result.Item.verified)
        return {
            statusCode:200,
            body:JSON.stringify({message:'user is not verified'})
        }
    const passwordverification = await bcryption.compare(password,result.Item.password)
    if(passwordverification){
        const token = await jwt({mail:result.Item.mail})
        return {
            statusCode:200,
            body:JSON.stringify({message:'login successful',token})
        }
    }
    return {
        statusCode:200,
        body:JSON.stringify({message:'mail or password is incorrect'})
    }
}