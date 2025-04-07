const corsheaders = require('/opt/nodejs/utilities/CorsHeaders')
exports.LogoutLambda = async (event) => {
  try{
      return corsheaders({
          statusCode:200,
          headers: {
              "Set-Cookie": "authToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None; Secure",
          },
          body: JSON.stringify({message:'logout successful'})
      })
  }
  catch{
    return corsheaders({
      statusCode:200,
      body: JSON.stringify({message:'an unexpected error occured'})
    })
  }
    
}
