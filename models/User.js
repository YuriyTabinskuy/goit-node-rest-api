import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    avatarURL: String,
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: String,
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false }
);

userSchema.post("save", (error, data, next) => {
  error.status = "400";
  next();
});
userSchema.post("findOneAndUpdate", (error, data, next) => {
  error.status = "400";
  next();
});

const User = model("user", userSchema);

export default User;