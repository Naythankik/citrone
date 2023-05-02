
const addGoogleUser = async (User,{
  id,
  email,
  firstName,
  lastName,
  profilePhoto,
}) => {
  const user = new User(User,{
    id,
    email,
    firstName,
    lastName,
    profilePhoto,
    source: "google", 
  });
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
