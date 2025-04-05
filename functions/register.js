const DBConnection = require('/opt/nodejs/services/dbservice')
const encryption = require('/opt/nodejs/utilities/bcrypt')
const jwt = require('/opt/nodejs/utilities/jwtGenerator')
const { PutCommand,GetCommand} = require('@aws-sdk/lib-dynamodb')
exports.registerlambda  = async (event,context) => {
    try{
        let {mail,password,admin} = JSON.parse(event.body);
        console.log(event.body)
        if(admin){
            console.log('admin user')
        }
        if(!mail || !password)
            return {
                statusCode:200,
                body:JSON.stringify({message:'username and password is required'})
            }
    
        const userExist = await DBConnection.send(
            new GetCommand({
                TableName:process.env.TableName,
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
                TableName:process.env.TableName,
                Item:{mail,password,verified:false,admin}
            })
        )
        const token = await jwt({mail,verified:false})
        return {
            statusCode:200,
            body:JSON.stringify({message:"user registered",token})
        }
    }
    catch{
        return {
            statusCode:200,
            body: JSON.stringify({message:'an unexpected error occured'})
        }
    }
}