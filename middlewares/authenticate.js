import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/User.js";

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization === undefined) {
      const error = new Error(`Authorization header not found!`);
      error.status = 401;
      throw error;
    }
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      const error = new Error(`Not authorized`);
      error.status = 401;
      throw error;
    }
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(id);
      if (!user || !user.token || user.token !== token) {
        const error = new Error(`Not authorized`);
        error.status = 401;
        throw error;
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export default authenticate;