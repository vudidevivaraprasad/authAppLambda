exports.LogoutLambda = async (event) => {
  try{
      return {
          statusCode:200,
          headers: {
              "Set-Cookie": "authToken=; Path=/; Max-Age=0; HttpOnly; SameSite=None; Secure",
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
