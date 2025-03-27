const jwt = require('jsonwebtoken')
module.exports = async (key,duration='5m') => {
    return await jwt.sign(key,"EnCoDeD-SeCrEt-KeY-256",{'expiresIn':duration})
}