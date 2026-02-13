import { Orders } from "../models/order.model.js";
import { Vender } from "../models/vender.model.js";
import { User } from "../models/user.model.js";
import { Dish } from "../models/dish.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================== CREATE ORDER ================== */
export const createOrder = asyncHandler(async (req, res, next) => {
  const { venderId, cartItems, dropLocation } = req.body;
  const customerId = req._id;

  if (!venderId) return res.status(400).json({ success: false, message: "Restaurant ID required" });
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart cannot be empty" });
  }
  if (!dropLocation || typeof dropLocation.latitude !== "number" || typeof dropLocation.longitude !== "number") {
    return res.status(400).json({ success: false, message: "Drop location required" });
  }

  const vender = await Vender.findById(venderId).populate("user");
  if (!vender) return res.status(400).json({ success: false, message: "Vendor not found" });

  const pickupLocation = vender.user?.location || {
    address: "Default Vendor Location",
    latitude: dropLocation.latitude,
    longitude: dropLocation.longitude
  };

  const dishIds = cartItems.map((item) => item.dishId);
  const dishes = await Dish.find({ _id: { $in: dishIds }, vender: venderId });
  if (dishes.length !== cartItems.length) {
    return res.status(400).json({ success: false, message: "Some dishes are invalid" });
  }

  let cartTotal = 0;
  cartItems.forEach((item) => { cartTotal += item.price * item.quantity; });
  const gstAmount = Math.ceil(cartTotal * 0.05);
  const grandTotal = cartTotal + gstAmount;

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  const distanceKm = Number(getDistanceKm(pickupLocation.latitude, pickupLocation.longitude, dropLocation.latitude, dropLocation.longitude).toFixed(2));
  const estimatedTimeMin = Math.ceil(distanceKm * 4);

  const snap = (loc) => ({ address: loc.address || "", latitude: loc.latitude, longitude: loc.longitude, geo: { type: "Point", coordinates: [loc.longitude, loc.latitude] } });

  const order = await Orders.create({
    customer: customerId,
    restaurant: venderId,
    deliveryDetails: { pickup: snap(pickupLocation), drop: snap(dropLocation), distanceKm, estimatedTimeMin },
    cartItems,
    bill: { cartTotal, gstAmount, grandTotal },
    currentStatus: "Placed",
  });

  vender.orders.push(order._id);
  await vender.save();

  res.status(201).json({ success: true, message: "Order created successfully", order });
});

/* ================== GET ORDER BY ID ================== */
export const getOrderById = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Orders.findById(orderId).populate("customer", "userId").populate("restaurant", "user").lean();
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.status(200).json({ success: true, order });
});

/* ================== UPDATE ORDER STATUS ================== */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const order = await Orders.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.currentStatus = status;
  await order.save();
  res.status(200).json({ success: true, message: "Order status updated", order });
});

/* ================== CANCEL ORDER ================== */
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { reason, cancelBy } = req.body;
  const order = await Orders.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (order.currentStatus === "Delivered" || order.currentStatus === "Canceled") {
    return res.status(400).json({ success: false, message: "Cannot cancel this order" });
  }

  order.currentStatus = "Canceled";
  order.cancellationDetails = { cancelBy, reason, userType: cancelBy };
  await order.save();
  res.status(200).json({ success: true, message: "Order canceled", order });
});

/* ================== CUSTOMER: GET ALL ORDERS ================== */
export const getAllCustomerOrders = asyncHandler(async (req, res, next) => {
  const orders = await Orders.find({ customer: req._id }).populate("restaurant", "shopName contactNumber").sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, totalOrders: orders.length, orders });
});

/* ================== CUSTOMER: GET ACTIVE ORDERS ================== */
export const getCustomerActiveOrders = asyncHandler(async (req, res, next) => {
  const orders = await Orders.find({ customer: req._id, currentStatus: { $nin: ["Delivered", "Canceled"] }, isActive: true }).populate("restaurant", "shopName contactNumber").sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, activeOrders: orders.length, orders });
});

/* ================== VENDER: GET ALL ORDERS ================== */
export const getAllVenderOrders = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });
  const orders = await Orders.find({ restaurant: vender._id }).populate("customer", "fullName contact").sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, totalOrders: orders.length, orders });
});

/* ================== VENDER: GET ACTIVE ORDERS ================== */
export const getVenderActiveOrders = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });
  const orders = await Orders.find({ restaurant: vender._id, currentStatus: { $nin: ["Delivered", "Canceled"] }, isActive: true }).populate("customer", "fullName contact").sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, activeOrders: orders.length, orders });
});

/* ================== GET ORDERS BY CUSTOMER ================== */
export const getOrdersByCustomer = asyncHandler(async (req, res, next) => {
  const orders = await Orders.find({ customer: req.params.customerId }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, orders });
});

/* ================== GET ORDERS BY VENDER ================== */
export const getOrdersByVender = asyncHandler(async (req, res, next) => {
  const orders = await Orders.find({ restaurant: req.params.venderId }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, orders });
});
