exports.LogoutLambda = async (event) => {
  try{
      const requestheaders = {
        "Access-Control-Allow-Origin": "http://localhost:4200", // Allow Angular frontend
        "Access-Control-Allow-Credentials": "true", // Required for cookies
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
      if (event.httpMethod === "OPTIONS") {
          console.log('inside options')
          return {
            statusCode: 200,
            headers: requestheaders,
            body: ""
          }
      }
      return {
          statusCode:200,
          headers: {
              ...requestheaders,
              "Set-Cookie": "authToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None; Secure",
          },
          body: JSON.stringify({message:'logout successful'})
      }
  }
  catch{
    return {
      statusCode:200,
      headers: requestheaders,
      body: JSON.stringify({message:'an unexpected error occured'})
    }
  }
    
}
