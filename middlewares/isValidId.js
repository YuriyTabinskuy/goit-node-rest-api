import { isValidObjectId } from "mongoose";

const isValidId = (req, res, next) => {
  const id = req.params.contactId;
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Id is not valid" });
  }
  next();
};

export default isValidId;