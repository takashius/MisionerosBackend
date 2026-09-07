import validator from "validator";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Schema, model } from "mongoose";
import config from "../../config/commons";
import { ALL_ROLES, ROLES } from "../../config/roles";
import { IUser, IUserModel } from "../../types/users";

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your first name."],
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
    trim: true,
  },
  banner: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Enter an email address."],
    validate: [validator.isEmail, "Enter a valid email address."],
    unique: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  /** false = pendiente del primer cambio de contraseña vía PATCH /user/profile. */
  hasLoggedInBefore: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ALL_ROLES,
    default: ROLES.PARTICIPANTE,
    required: true,
  },
  password: {
    type: String,
    required: [true, "Missing password."],
    minLength: [8, "Your password must contain at least 8 characters"],
  },
  recovery: [
    {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const objToken = {
    _id: user._id,
    date: new Date(),
  };
  const token = sign(objToken, config.JWT_KEY, { expiresIn: "24h" });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  if (!validator.isEmail(email)) {
    throw new Error("Invalid login credentials");
  }
  const user = await User.findOne({ email }).select("-__v");

  if (!user) {
    throw new Error("Invalid login credentials");
  }
  const isPasswordMatch = await compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid login credentials");
  }
  return user;
};

const User = model<IUser, IUserModel>("User", userSchema);
export { User };
