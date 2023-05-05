const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
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
      // match: /.+\@.+\..+/,
      unique: true,
    },
    phoneNumber: {

      type: String,
      required: [true, "phone number is required"],
      unique: true,
    },
    password: {
      type: String,
      // required: [true, "password is required"], //not required if the signing source is not form data
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
    // source: {
    //   type: String,
    //   enum: ["google", "facebook", "form"], //needed to allow third party auth for all users
    //   default: ["form"]
    // },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lesson",
    },
    assignment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "assignment",
      },
    ],
    passwordResetToken: String,
    forgetPasswordExpires: Date,
    registrationToken: String,
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
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
