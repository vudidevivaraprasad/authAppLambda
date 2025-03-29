const { ScanCommand } = require('@aws-sdk/lib-dynamodb')
const DBConnection = require('/opt/nodejs/services/dbservice')
const {CreateTableCommand}  = require('@aws-sdk/client-dynamodb')
// exports.hellolambda  = async (event,context) => {
//     // console.log("event",event);
//     // console.log("context", context);
//     let {mail,password} = JSON.parse(event.body);
//     password = await encryption(password)
//     console.log("password",password,"type",typeof(password))
//     await DBConnection.send(
//         new PutCommand({
//             TableName:'AuthTable',
//             Item:{mail,password,verified:false}
//         })
//     ).then(data => {
//         console.log('data',data)
//     })
//     return {
//         statusCode:200,
//         body:JSON.stringify({message:"user registered"})
//     }
    
// }
// exports.hellolambda2 = async (event,context) => {
//     const {mail} = JSON.parse(event.body);
//     const result = await DBConnection.send(
//         new GetCommand({
//             TableName:'AuthTable',
//             Key:{mail}
//         })
//     )
//     console.log('result',result)
//     return {
//         statusCode:200,
//         body:JSON.stringify(result.Item)
//     }
// }
exports.hellolambda3 = async (event,context) => {
    const result = await DBConnection.send(
        new CreateTableCommand({
            TableName:'AuthTable',
            AttributeDefinitions:[
                {
                    AttributeName:'mail',
                    AttributeType:'S'
                }
            ],
            KeySchema:[
                {
                    AttributeName:'mail',
                    KeyType:'HASH'
                }
            ],
            ProvisionedThroughput:{
                ReadCapacityUnits:1,
                WriteCapacityUnits:1
            }
        })
    )
    console.log('result',result)
    return {
        statusCode:200,
        body:JSON.stringify({message:"table created"})
    }
}
exports.allusers = async (event) => {
    const users = await DBConnection.send(
        new ScanCommand({
            TableName:'AuthTable'
        })
    )
    console.log("users",users)
    return {
        statusCode:200,
        body:JSON.stringify({data:users.Items})
    }
}