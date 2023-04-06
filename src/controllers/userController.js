const { StatusCodes } = require("http-status-codes");
const { User } = require("../../models");


const getUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
            return;
        }
        res.status(StatusCodes.OK).json({ data: user });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
    }
};

const updateUserProfile = async (req, res) => {
    //use the authentication to fetch the user data from the database
    const { id } = req.params;
    try {
        const user = await User.findById(id);

        await User.findOneAndUpdate({ id }, { $set: req.body });
        res.status(202).send("Profile has been edited!!!");
    } catch (error) {
        throw new Error(error);
    }
    return;
};

module.exports = {
    getUserAccount,
    updateUserProfile
  };