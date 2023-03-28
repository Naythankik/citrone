const crypto = require('crypto');

//we first need to generate a random 4 char string
function generateRandomString(firstName) {
    const randomString = crypto.randomBytes(2).toString('hex');
    return firstName + '_' + randomString;
  }

//the random string is added to the first name to generate the username
// if the username already exists, the loop continues until a unique username is generated
const generateUsername = async (User, firstName) => {
    let username = generateRandomString(firstName);
    let user = await User.findOne({ username });
    while (user) {
        username = generateRandomString(firstName);
        user = await User.findOne({ username });
    }
    return username
}
module.exports = generateUsername
          