import { Vender } from "../models/vender.model.js";
import { Orders } from "../models/order.model.js";
import { Dish } from "../models/dish.model.js";
import { User } from "../models/user.model.js";
import { Customer } from "../models/customer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper for week calculation (ISO-8601)
const getISOWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/* ================== GET VENDER PROFILE ================== */
export const getVenderProfile = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id })
    .populate("user", "fullName email contact location")
    .populate("orders")
    .lean();

  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });

  res.status(200).json({ success: true, vender });
});

/* ================== CREATE ORDER ================== */
export const createOrder = asyncHandler(async (req, res, next) => {
  const { venderId, cartItems, dropLocation } = req.body;
  const customerId = req._id;

  if (!venderId) return res.status(400).json({ success: false, message: "Vender ID required" });
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart cannot be empty" });
  }
  if (!dropLocation || typeof dropLocation.latitude !== "number" || typeof dropLocation.longitude !== "number") {
    return res.status(400).json({ success: false, message: "Customer drop location (lat,lng) required" });
  }

  const customerDoc = await Customer.findOne({ userId: customerId });
  if (!customerDoc) return res.status(400).json({ success: false, message: "Customer profile not found" });

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
    return res.status(400).json({ success: false, message: "Some dishes are invalid for this vendor" });
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
    customer: customerDoc._id,
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

/* ================== UPDATE VENDER PROFILE ================== */
export const updateVenderProfile = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOneAndUpdate({ user: req._id }, req.body, { new: true });
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });
  res.status(200).json({ success: true, message: "Profile updated", vender });
});

/* ================== ADD DISH ================== */
export const addDish = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vendor profile not found" });

  const dish = await Dish.create({ ...req.body, vender: vender._id });
  res.status(201).json({ success: true, message: "Dish added successfully", dish });
});

/* ================== UPDATE DISH ================== */
export const updateDish = asyncHandler(async (req, res, next) => {
  const { dishId } = req.params;
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vendor profile not found" });

  const dish = await Dish.findOneAndUpdate({ _id: dishId, vender: vender._id }, req.body, { new: true });
  if (!dish) return res.status(404).json({ success: false, message: "Dish not found" });
  res.status(200).json({ success: true, message: "Dish updated", dish });
});

/* ================== DELETE DISH ================== */
export const deleteDish = asyncHandler(async (req, res, next) => {
  const { dishId } = req.params;
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vendor profile not found" });

  const dish = await Dish.findOneAndDelete({ _id: dishId, vender: vender._id });
  if (!dish) return res.status(404).json({ success: false, message: "Dish not found" });

  res.status(200).json({ success: true, message: "Dish deleted" });
});

/* ================== GET MY ORDERS ================== */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });

  const orders = await Orders.find({ restaurant: vender._id })
    .populate("customer", "userId")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, orders });
});

/* ================== UPDATE ORDER STATUS ================== */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });

  const order = await Orders.findOne({ _id: orderId, restaurant: vender._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.currentStatus = status;
  await order.save();
  res.status(200).json({ success: true, message: "Order status updated", order });
});

/* ================== CALCULATE EARNINGS ================== */
export const calculateEarnings = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id }).populate("orders");
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });

  let today = 0, thisWeek = 0, thisMonth = 0, total = 0;
  const now = new Date();
  const currentWeek = getISOWeek(now);

  vender.orders.forEach(order => {
    if (order.currentStatus === "Delivered") {
      const g = order.bill.grandTotal;
      total += g;
      const d = new Date(order.createdAt);
      if (d.toDateString() === now.toDateString()) today += g;
      if (getISOWeek(d) === currentWeek && d.getFullYear() === now.getFullYear()) thisWeek += g;
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) thisMonth += g;
    }
  });

  vender.earnings = { today, thisWeek, thisMonth, total };
  await vender.save();
  res.status(200).json({ success: true, message: "Earnings updated", earnings: vender.earnings });
});

/* ================== TOGGLE AVAILABILITY ================== */
export const toggleAvailability = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });

  vender.isActive = !vender.isActive;
  await vender.save();
  res.status(200).json({ success: true, message: `Vender is now ${vender.isActive ? "active" : "inactive"}`, isActive: vender.isActive });
});

/* ================== GET NEARBY VENDORS ================== */
export const getNearbyVenders = asyncHandler(async (req, res, next) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });

  const latitude = parseFloat(lat), longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) return res.status(400).json({ success: false, message: "Invalid coordinates" });

  const nearby = await User.find({
    role: "Vender",
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: 5000
      }
    }
  }).select("_id");

  const vendors = await Vender.find({ user: { $in: nearby.map(u => u._id) }, isActive: true })
    .populate("user", "fullName contact location")
    .lean();

  res.status(200).json({ success: true, count: vendors.length, vendors });
});

/* ================== UPDATE LIVE LOCATION ================== */
export const updateVenderLiveLocation = asyncHandler(async (req, res, next) => {
  const { latitude, longitude } = req.body;
  if (latitude === undefined || longitude === undefined) return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });

  const lat = Number(latitude), lng = Number(longitude);
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return res.status(400).json({ success: false, message: "Invalid coordinates" });

  const user = await User.findById(req._id);
  if (!user || user.role !== "Vender") return res.status(403).json({ success: false, message: "Only vendor can update live location" });

  user.location = { ...user.location, latitude: lat, longitude: lng, geo: { type: "Point", coordinates: [lng, lat] } };
  await user.save();

  res.status(200).json({ success: true, message: "Live location updated", location: user.location });
});

/* ================== GET ALL VENDORS ================== */
export const getAllVenders = asyncHandler(async (req, res, next) => {
  const vendors = await Vender.find({ isActive: true }).populate("user", "fullName contact location email").lean();
  res.status(200).json({ success: true, count: vendors.length, vendors });
});

/* ================== GET VENDOR BY ID ================== */
export const getVenderById = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findById(req.params.id).populate("user", "fullName email contact location").lean();
  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });
  res.status(200).json({ success: true, vender });
});
