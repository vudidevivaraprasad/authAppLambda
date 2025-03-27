const bcrypt = require('bcryptjs');
module.exports = async (value) => {
    return await bcrypt.hash(value,10)
}