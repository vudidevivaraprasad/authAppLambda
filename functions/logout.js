exports.LogoutLambda = async (event) => {
  try{
      return {
          statusCode:200,
          headers: {
              "Set-Cookie": "authToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None; Secure",
              // "Set-Cookie": `authToken=; Path=/; Max-Age=604800; HttpOnly;`

          },
          body: JSON.stringify({message:'logout successful'})
      }
  }
  catch{
    return {
      statusCode:200,
      body: JSON.stringify({message:'an unexpected error occured'})
    }
  }
    
}
