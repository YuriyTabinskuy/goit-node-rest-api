import User from "../models/User.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";
import "dotenv/config";

const avatarPath = path.resolve("public", "avatars");
const verificationToken = nanoid();

const userSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...["starter", "pro", "business"])
    .required(),
});

const resendVerifySchema = Joi.object({
  email: Joi.string().required(),
});

const { JWT_SECRET } = process.env;

const verifyUser = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerify = async (req, res, next) => {
  try {
    const resendVerifyValidate = resendVerifySchema.validate(req.body);
    if (resendVerifyValidate.error) {
      const error = new Error(resendVerifyValidate.error.message);
      error.status = 400;
      throw error;
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    if (user.verify) {
      const error = new Error("Verification has already been passed");
      error.status = 400;
      throw error;
    }
    const verifyEmail = {
      to: "vomoh87045@gyxmz.com",
      subject: "Verify email",
      html: `<a target="_blank" href="http://localhost:3000/users/verify/${verificationToken}">Click to verify your email</a>`,
    };
    await sendEmail(verifyEmail);
    res.json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const userValidate = userSchema.validate(req.body);
    if (userValidate.error) {
      const error = new Error(userValidate.error.message);
      error.status = 400;
      throw error;
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const error = new Error("Email in use");
      error.status = 409;
      throw error;
    }
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const httpUrl = gravatar.url(req.body.email, {
      protocol: "http",
      s: "250",
    });
    const newUser = await User.create({
      ...req.body,
      avatarURL: httpUrl,
      password: hashPassword,
      verificationToken,
    });
    const verifyEmail = {
      to: "vomoh87045@gyxmz.com",
      subject: "Verify email",
      html: `<a target="_blank" href="http://localhost:3000/users/verify/${verificationToken}">Click to verify your email</a>`,
    };
    await sendEmail(verifyEmail);
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const userValidate = userSchema.validate(req.body);
    if (userValidate.error) {
      const error = new Error(userValidate.error.message);
      error.status = 400;
      throw error;
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const error = new Error("Email or password is wrong");
      error.status = 401;
      throw error;
    }

    if (!user.verify) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!comparePassword) {
      const error = new Error("Email or password is wrong");
      error.status = 401;
      throw error;
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        email: user.email,
        avatarURL: user.avatarURL,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.json({ email, subscription });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, { token: "" });
    if (!user) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const updateSubscriptionValidate = updateSubscriptionSchema.validate(
      req.body
    );
    if (updateSubscriptionValidate.error) {
      const error = new Error(updateSubscriptionValidate.error.message);
      error.status = 400;
      throw error;
    }
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(
      _id,
      {
        subscription: req.body.subscription,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!user) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("File not exist");
      error.status = 404;
      throw error;
    }
    const { path: oldPath, filename } = req.file;
    const image = await Jimp.read(oldPath);
    image.resize(250, 250);
    await image.writeAsync(oldPath);
    const newPath = path.join(avatarPath, filename);
    await fs.rename(oldPath, newPath);
    const avatarURL = path.join("avatars", filename);
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(
      _id,
      {
        avatarURL,
      },
      {
        new: true,
      }
    );
    if (!user) {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }
    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  verifyUser,
  resendVerify,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
};