import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";
import { Vender } from "../models/vender.model.js";
import { Orders } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================== GET CUSTOMER PROFILE ================== */
export const getCustomerProfile = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findOne({ userId: req.user.userId })
    .populate("userId", "fullName email contact location")
    .lean();

  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

  res.status(200).json({ success: true, customer });
});

/* ================== UPDATE CUSTOMER PROFILE ================== */
export const updateCustomerProfile = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findOne({ userId: req.user.userId });
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

  const user = await User.findByIdAndUpdate(customer.userId, req.body, { new: true });
  res.status(200).json({ success: true, message: "Profile updated", user });
});

/* ================== GET NEARBY VENDORS ================== */
export const getNearbyVenders = asyncHandler(async (req, res, next) => {
  const { latitude, longitude, radiusKm = 5 } = req.query;

  const venders = await Vender.find({
    isActive: true,
    "user.location.geo": {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
        $maxDistance: radiusKm * 1000,
      },
    },
  }).populate("user", "fullName contact location").lean();

  res.status(200).json({ success: true, venders });
});

/* ================== PLACE ORDER ================== */
export const placeOrder = asyncHandler(async (req, res, next) => {
  const { restaurantId, cartItems, deliveryDetails, bill } = req.body;

  const order = await Orders.create({
    customer: req.user.userId,
    restaurant: restaurantId,
    cartItems,
    deliveryDetails,
    bill,
    currentStatus: "Placed",
  });

  const vender = await Vender.findOne({ user: restaurantId });
  if (vender) {
    vender.orders.push(order._id);
    await vender.save();
  }

  res.status(201).json({ success: true, message: "Order placed", order });
});

/* ================== TRACK ORDER ================== */
export const trackOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Orders.findOne({ _id: orderId, customer: req.user.userId }).lean();
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  res.status(200).json({ success: true, order });
});

/* ================== RATE ORDER ================== */
export const rateOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { restaurantRating, foodRating, deliveryRating } = req.body;

  const order = await Orders.findOne({ _id: orderId, customer: req.user.userId });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.ratingDetails = { restaurant: restaurantRating, food: foodRating, deliveryAgent: deliveryRating };
  await order.save();

  const vender = await Vender.findOne({ user: order.restaurant });
  if (vender) {
    vender.ratingTotal += restaurantRating;
    vender.ratingCount += 1;
    vender.avgRating = vender.ratingTotal / vender.ratingCount;
    await vender.save();
  }

  res.status(200).json({ success: true, message: "Order rated successfully", order });
});

/* ================== GET ORDER HISTORY ================== */
export const getOrderHistory = asyncHandler(async (req, res, next) => {
  const orders = await Orders.find({ customer: req.user.userId }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, orders });
});

/* ================== CANCEL ORDER ================== */
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Orders.findOne({ _id: orderId, customer: req.user.userId });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (order.currentStatus === "Delivered" || order.currentStatus === "Canceled") {
    return res.status(400).json({ success: false, message: "Cannot cancel this order" });
  }

  order.currentStatus = "Canceled";
  order.cancellationDetails = { cancelBy: req.user.userId, reason: req.body.reason, userType: "Customer" };
  await order.save();

  res.status(200).json({ success: true, message: "Order canceled", order });
});
