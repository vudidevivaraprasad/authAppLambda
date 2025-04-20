module.exports = (value) => {
    const headers = {
        // "Access-Control-Allow-Origin": "http://127.0.0.1:4200",
        "Access-Control-Allow-Origin": "https://lambda-frontend-olive.vercel.app",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Credentials": "true"
    }
    if(value?.headers){
        console.log('contains headers')
        return {
            statusCode: value.statusCode,
            body: value.body,
            headers:{
                ...headers,
                ...value.headers
            }
        }
    }
    console.log('no headers')
    return {
        ...value,
        headers
    }

}