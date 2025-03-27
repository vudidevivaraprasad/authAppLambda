const DBConnection = require('./services/dbservice')
const encryption = require('./utilities/bcrypt')
const jwt = require('./utilities/jwtGenerator')
const { PutCommand,GetCommand} = require('@aws-sdk/lib-dynamodb')
exports.registerlambda  = async (event,context) => {
    let {mail,password} = JSON.parse(event.body);
    if(!mail || !password)
        return {
            statusCode:200,
            body:JSON.stringify({message:'username and password is required'})
        }

    const userExist = await DBConnection.send(
        new GetCommand({
            TableName:'AuthTable',
            Key:{mail}
            })
        )
    if(userExist.Item)
        return {
            statusCode:200,
            body:JSON.stringify({message:'user already exists'})
        }

    password = await encryption(password)
    await DBConnection.send(
        new PutCommand({
            TableName:'AuthTable',
            Item:{mail,password,verified:false}
        })
    )
    const token = await jwt({mail,verified:false})
    return {
        statusCode:200,
        body:JSON.stringify({message:"user registered",token})
    }
}