import User from "../models/User.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import Jimp from "jimp";
import "dotenv/config";

const avatarPath = path.resolve("public", "avatars");

const userSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...["starter", "pro", "business"])
    .required(),
});

const { JWT_SECRET } = process.env;

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
    });
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
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
};