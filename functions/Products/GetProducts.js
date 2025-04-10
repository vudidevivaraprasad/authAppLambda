const DBConnection = require('/opt/nodejs/services/dbservice')
const {ScanCommand,GetCommand} = require('@aws-sdk/lib-dynamodb')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')

exports.GetProductsLambda = async (event) => {
    if (event.httpMethod === 'OPTIONS'){
        return corsheaders({
            statusCode: 200,
            body: ''
        })
    }
    const pathparams = event.pathParameters
    console.log('pathparams',pathparams)
    let result;
    if(pathparams){
        result =  await DBConnection.send(
            new GetCommand({
                TableName:process.env.ProductsTable,
                Key:{id:pathparams.id}
            })
        )
    }
    else{
        result = await DBConnection.send(
                new ScanCommand({
                    TableName:process.env.ProductsTable
                })
        )
    }  
    
    console.log('result',result)
    console.log('result',result.Items)
    return corsheaders({
        statusCode:200,
        body:JSON.stringify({result:pathparams?result.Item:result.Items})
    })
}