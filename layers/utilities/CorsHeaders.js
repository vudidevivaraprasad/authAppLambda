module.exports = (value) => {
    const headers = {
        "Access-Control-Allow-Origin": "http://127.0.0.2:4200",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
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