const User = require("../");

const addGoogleUser = async ({
  id,
  email,
  firstName,
  lastName,
  profilePhoto,
}) => {
  const user = new User({
    id,
    email,
    firstName,
    lastName,
    profilePhoto,
    source: "google",
  });
  return user.save();
};

const getUsers = async () => {
  return User.find({});
};

const getUserByEmail = async ({ email }) => {
  return await User.findOne({
    email,
  });
};

module.exports = {
  addGoogleUser,
  getUsers,
  getUserByEmail,
};
