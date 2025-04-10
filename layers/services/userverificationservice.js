module.exports = async (token) => {
    try {
        url = "https://et1in74t39.execute-api.us-east-1.amazonaws.com/Prod"
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