import mongoose from "mongoose";

const venderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    imageUrl: String,

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    
    
    ratingTotal: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    foodType: {
      type: String,
      enum: ["Vegetables", "Fruits", "Both"],
      default: "Vegetables",
    },
    avgRating: { type: Number, default: 0 },
    orderPlaced: { type: Number, default: 0 },
    orderServed: { type: Number, default: 0 },
    totalDishes: { type: Number, default: 0 },
    earnings: {
      today: { type: Number, default: 0 },
      thisWeek: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Vender = mongoose.model("Vender", venderSchema);
