const {ScanCommand} = require('@aws-sdk/lib-dynamodb')
const DBConnection = require('/opt/nodejs/services/dbservice')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')

exports.GetProductsForCategoryLambda = async (event) => {
    if (event.httpMethod === 'OPTIONS'){
        return corsheaders({
            statusCode: 200,
            body: ''
        })
    }
    const pathparams = event.pathParameters
    const queryparams = event.queryStringParameters
    console.log('queryparams',queryparams)
    console.log('pathparams',pathparams)
    if(!queryparams){
        const result = await DBConnection.send(
            new ScanCommand({
                TableName:process.env.ProductsTable,
                FilterExpression: "category = :category", // Filter on category
                ExpressionAttributeValues: {
                ":category": pathparams.name
                }
            })
        )
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({Items:result.Items})
        })
    }

    const query = {
        TableName:process.env.ProductsTable,
        FilterExpression: queryparams.minprice && queryparams.maxprice ?'category = :category AND price BETWEEN :minprice AND :maxprice'
                            : queryparams.minprice ? 'category = :category AND price < :minprice'
                            : queryparams.maxprice ? 'category = :category AND price > :maxprice'
                            : 'category = :category',
        ExpressionAttributeValues: queryparams.minprice && queryparams.maxprice ? {":category":pathparams.name,":minprice":parseInt(queryparams.minprice),":maxprice":parseInt(queryparams.maxprice)}
                                    : queryparams.minprice ? {":category":pathparams.name,":minprice":parseInt(queryparams.minprice)}
                                    : queryparams.maxprice ? {":category":pathparams.name,":maxprice":parseInt(queryparams.maxprice)}
                                    : {":category": pathparams.name}
    }
    const result = await DBConnection.send(
        new ScanCommand(query)
    )
    console.log('result',result.Items)
    return corsheaders({
        statusCode:200,
        body:JSON.stringify({Items:result.Items})
    })
}