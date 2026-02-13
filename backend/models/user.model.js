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
      match: /^\d{10}$/,
      unique: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "Customer",
    },
    location: {
      type: locationSchema,
      required: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
