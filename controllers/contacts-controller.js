import Contact from "../models/Contact.js";
import Joi from "joi";

const contactAddScheme = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "missing required name field",
    "string.base": "name must be text",
  }),
  email: Joi.string().required().messages({
    "any.required": "missing required email field",
    "string.base": "email must be text",
  }),
  phone: Joi.string().required().messages({
    "any.required": "missing required phone field",
    "string.base": "phone must be text",
  }),
  favorite: Joi.boolean(),
});

const contactUpdateScheme = Joi.object({
  name: Joi.string().messages({
    "string.base": "name must be text",
  }),
  email: Joi.string().messages({
    "string.base": "email must be text",
  }),
  phone: Joi.string().messages({
    "string.base": "phone must be text",
  }),
  favorite: Joi.boolean(),
});

const contactUpdateFavoriteScheme = Joi.object({
  favorite: Joi.boolean().required(),
});

const getAllContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10, favorite } = req.query;
    const skip = (page - 1) * limit;
    if (favorite === undefined) {
      const result = await Contact.find({ owner }, "", {
        skip,
        limit,
      }).populate("owner", "email subscription");
      res.status(200).json(result);
    } else {
      const result = await Contact.find({ owner, favorite }, "", {
        skip,
        limit,
      }).populate("owner", "email subscription");
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const result = await Contact.findOne({
      _id: req.params.contactId,
      owner,
    }).populate("owner", "email subscription");
    if (!result) {
      const error = new Error(
        `Contact with id=${req.params.contactId} not found!`
      );
      error.status = 404;
      throw error;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const contactValidate = contactAddScheme.validate(req.body);
    if (contactValidate.error) {
      const error = new Error(contactValidate.error.message);
      error.status = 400;
      throw error;
    }
    const { _id: owner } = req.user;
    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndDelete({
      _id: req.params.contactId,
      owner,
    });
    if (!result) {
      const error = new Error(`Not found!`);
      error.status = 404;
      throw error;
    }
    res.status(200).json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const contactValidate = contactUpdateFavoriteScheme.validate(req.body);
    if (contactValidate.error) {
      const error = new Error(contactValidate.error.message);
      error.status = 400;
      throw error;
    }
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("owner", "email subscription");
    if (!result) {
      const error = new Error(
        `Contact with id=${req.params.contactId} not found!`
      );
      error.status = 404;
      throw error;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const contactValidate = contactUpdateScheme.validate(req.body);
    if (contactValidate.error) {
      const error = new Error(contactValidate.error.message);
      error.status = 400;
      throw error;
    }
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndUpdate(
      { _id: req.params.contactId, owner },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("owner", "email subscription");
    if (!result) {
      const error = new Error(
        `Contact with id=${req.params.contactId} not found!`
      );
      error.status = 404;
      throw error;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllContacts,
  getContactById,
  addContact,
  deleteContact,
  updateContact,
  updateStatusContact,
};