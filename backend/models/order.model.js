import mongoose from "mongoose";
import { locationSchema } from "./location.model.js";

export const OrderStatusOptions = [
  "Pending",
  "Placed",
  "Confirmed",
  "Preparing",
  "ReadyForPickup",
  "AcceptedByAgent",
  "OutForDelivery",
  "Delivered",
  "Canceled",
];

const otpSchema = new mongoose.Schema(
  {
    code: { type: String, minlength: 6, maxlength: 6 },
    expiresAt: { type: Date },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vender",
      required: true,
    },
    deliveryDetails: {
      pickup: { type: locationSchema, required: true },
      drop: { type: locationSchema, required: true },
      distanceKm: { type: Number, required: true },
      estimatedTimeMin: { type: Number, required: true },
      parcelDeliveredOtp: otpSchema,
    },
    cartItems: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        name: { type: String, required: true },
        imageUrl: String,
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    bill: {
      cartTotal: { type: Number, required: true },
      gstAmount: { type: Number, required: true },
      grandTotal: { type: Number, required: true },
    },
    currentStatus: {
      type: String,
      enum: OrderStatusOptions,
      required: true,
      default: "Pending",
    },
    statusDetails: [
      {
        status: { type: String, enum: OrderStatusOptions, required: true },
        time: { type: Date, required: true },
      },
    ],
    razorpayOrderId: String,
    paymentId: String,
    isVerified: { type: Boolean, default: false },
    cancellationDetails: {
      cancelBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: {
        type: String,
        required: function () {
          return this.currentStatus === "Canceled";
        },
      },
      userType: {
        type: String,
        enum: ["Restaurant_Owner", "Customer"],
        required: function () {
          return this.currentStatus === "Canceled";
        },
      },
    },
    ratingDetails: {
      restaurant: { type: Number, min: 0, max: 5 },
      deliveryAgent: { type: Number, min: 0, max: 5 },
      food: { type: Number, min: 0, max: 5 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for status-based queries
orderSchema.index({ currentStatus: 1 });

// Pre-save hook to push status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("currentStatus")) {
    const lastStatus =
      this.statusDetails?.[this.statusDetails.length - 1]?.status;
    if (lastStatus !== this.currentStatus) {
      this.statusDetails.push({ status: this.currentStatus, time: new Date() });
    }
  }
  next();
});

export const Orders = mongoose.model("Order", orderSchema);
