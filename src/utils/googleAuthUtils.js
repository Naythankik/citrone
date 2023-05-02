const generateUsername = require("./generateUsername")
const addGoogleUser = async (User,{
  id,
  email,
  firstName,
  lastName,
//   profilePhoto,
}) => {
  const user = await new User({
    id,
    email,
    firstName,
    lastName,
    // profilePhoto,
    source: "google", 
  });
user.username = await generateUsername(User,user.firstName) //generate username for user signing up with google auth

  return user.save();
};

const getUsers = async (User) => {
  return User.find({});
};

const getUserByEmail = async (User,{ email }) => {
  return await User.findOne({
    email,
  });
};

module.exports = {
  addGoogleUser,
  getUsers,
  getUserByEmail,
};
