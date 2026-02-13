import mongoose from "mongoose";
import { locationSchema } from "./location.model.js";

export const USER_ROLES = ["Customer", "Vender"];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
      minlength: 6,
    },
    contact: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
      unique: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    location: {
      type: locationSchema,
      required: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
