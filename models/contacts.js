import { Schema, model } from "mongoose";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
  }
);
contactSchema.post("save", (error, data, next) => {
  error.status = "400";
  next();
});
contactSchema.post("findOneAndUpdate", (error, data, next) => {
  error.status = "400";
  next();
});

const Contact = model("contact", contactSchema);

export default Contact;