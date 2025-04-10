const DBConnection = require('/opt/nodejs/services/dbservice')
const {PutCommand} = require('@aws-sdk/lib-dynamodb')
const s3 = require('/opt/nodejs/services/bucketservice')
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
const { v4: uuidv4 } = require('uuid');
const userverification = require('/opt/nodejs/services/userverificationservice')

exports.CreateProductLambda = async (event) => {            
    try{
        if (event.httpMethod === 'OPTIONS'){
            return corsheaders({
                statusCode: 200,
                body: ''
            })
        }
        const cookie = event.headers?.Cookie
        let adminuser;
        if(!cookie){
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({message:'unauthorized access'})
            })
        }
        const token = cookie.split('=')[0] == 'authToken' ? cookie.split('=')[1] : false;
        if(!token){
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({message:'unauthorized access'})
            })
        }
        
        // const role = await fetch(`http://host.docker.internal:3000/userverification?token=${token}`)

        // if(role.ok){
        //     const result = await role.json()
        //     console.log('result data',result)
        //     adminuser = result.message === "admin user"?true:false
        // }
        const result = await userverification(token)
        adminuser = result === "admin"?true:false

        if(adminuser){
            const {title,description,price,category,subcategory,imageBase64,imageName} = JSON.parse(event.body)
            console.log('imagebase64',imageBase64)
            console.log('imagename',imageName)
            const filename = `${Date.now()}.jpg`
            const command = new PutObjectCommand({
                Bucket:'learning-commers-products',
                Key:filename,
                Body:Buffer.from(imageBase64,'base64'),
                ContentType: "image/jpeg",
            })
            const upload =await s3.send(command)
            const product = {
                    id:uuidv4(),
                    title,
                    description,
                    price,
                    image:filename,
                    category,
                    subcategory,
                    createdAt:Date.now(),
                    updatedAt:Date.now()
                }
            const result = await DBConnection.send(
                new PutCommand({
                    TableName: process.env.ProductsTable,
                    Item:product
                })
            )
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({message:'product uploaded successfullt',result:result.Items})
            })
        }
        else{
            return corsheaders({
                statusCode:200,
                body:JSON.stringify({message:'you are not having access'})
            })
        }
    }
    catch{
        return corsheaders({
            statusCode:200,
            body:JSON.stringify({message:'error occured'})
        })
    }
}