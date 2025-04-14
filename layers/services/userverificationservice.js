module.exports = async (token) => {
    try {
        // url = "https://et1in74t39.execute-api.us-east-1.amazonaws.com/Prod"
        url = 'http://127.0.0.1:3000'
        const role = await fetch(`${url}/userverification?token=${token}`)
        if(role.ok){
            const result = await role.json()
            return result.message
        }
    }
    catch{
        return "error"
    }
}