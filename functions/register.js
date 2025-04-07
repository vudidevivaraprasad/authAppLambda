const DBConnection = require('/opt/nodejs/services/dbservice')
const encryption = require('/opt/nodejs/utilities/bcrypt')
const jwt = require('/opt/nodejs/utilities/jwtGenerator')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const { PutCommand,GetCommand} = require('@aws-sdk/lib-dynamodb')
const { v4: uuidv4 } = require('uuid');

exports.registerlambda  = async (event,context) => {
    try{
        if (event.httpMethod === 'OPTIONS'){
            return corsheaders({
                statusCode: 200,
                body: ''
            })
        }
        let {mail,password,admin} = JSON.parse(event.body);
        console.log(event.body)
        if(admin){
            console.log('admin user')
        }
        if(!mail || !password)
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({message:'username and password is required'})
            })
    
        const userExist = await DBConnection.send(
            new GetCommand({
                TableName:process.env.TableName,
                Key:{mail}
                })
            )
        if(userExist.Item)
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({message:'user already exists'})
            })
    
        password = await encryption(password)
        let uuid = uuidv4()
        await DBConnection.send(
            new PutCommand({
                TableName:process.env.TableName,
                Item:{mail,password,verified:false,admin,user_id:uuid}
            })
        )
        await DBConnection.send(
            new PutCommand({
                TableName:process.env.UserDetailsTable,
                Item:{
                    user_id:uuid,
                    address:[],
                    cart:[],
                    wishlist:[],
                    orders:[]
                }
            })
        )
        const token = await jwt({mail,verified:false})
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:"user registered",token})
        })
    }
    catch{
        return corsheaders({
            statusCode:200,
            body: JSON.stringify({message:'an unexpected error occured'})
        })
    }
}