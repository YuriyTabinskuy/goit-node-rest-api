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
    const result = await Contact.find();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const result = await Contact.findById(req.params.contactId);
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
    const result = await Contact.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const result = await Contact.findByIdAndDelete(req.params.contactId);
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
    const result = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
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
    const result = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
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