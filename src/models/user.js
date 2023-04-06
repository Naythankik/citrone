const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "first name is required"],
    min: 2,
  },
  lastName: {
    type: String,
    required: [true, "last name is required"],
    min: 2,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true, // `email` must be unique
    match: /.+\@.+\..+/,
    unique: true,
  },
  phoneNumber: {
    type: Number,
    required: [true, "phone number is required"],
    unique: true,
    min: 10,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    min: 6,
  },
  username: {
    // a unique username will be generated for user by the server
    type: String,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "tutor", "learner"],
    default: "learner",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  status: {
    /** this will remain pending until email verification is done. */
    type: String,
    enum: ["approved", "pending"],
    default: "pending",
  },
  token: String,
  passwordResetToken: String,
  forgetPasswordExpires: Date,
  deactivate: {
    type: Boolean,
    default: false,
  },
  deactivateExpiresIn: Date,
});

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
