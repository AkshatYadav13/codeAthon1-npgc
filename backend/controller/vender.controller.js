import { Vender } from "../models/vender.model.js";
import { Orders } from "../models/order.model.js";
import { Dish } from "../models/dish.model.js";
import { User } from "../models/user.model.js";
import { Customer } from "../models/customer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================== GET VENDER PROFILE ================== */
export const getVenderProfile = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id })
    .populate("user", "fullName email contact location")
    .populate("orders")
    .lean();

  if (!vender) return res.status(404).json({ message: "Vender not found" });

  res.status(200).json({ success: true, vender });
});

/* ================== CREATE ORDER ================== */
export const createOrder = asyncHandler(async (req, res, next) => {
  const { venderId, cartItems, dropLocation } = req.body;
  const customerId = req._id;

  /* ================= VALIDATION ================= */

  if (!venderId) {
    return res.status(400).json({ success: false, message: "Vender ID required" });
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart cannot be empty" });
  }

  if (
    !dropLocation ||
    typeof dropLocation.latitude !== "number" ||
    typeof dropLocation.longitude !== "number"
  ) {
    return res.status(400).json({
      success: false,
      message: "Customer drop location (lat,lng) required",
    });
  }

  /* ================= FETCH CUSTOMER ================= */

  const customer = await User.findById(customerId);
  if (!customer) {
    return res.status(400).json({ success: false, message: "Customer not found" });
  }

  const customerDoc = await Customer.findOne({ userId: customerId });
  if (!customerDoc) {
    return res.status(400).json({ success: false, message: "Customer profile not found. Please ensure you are logged in as a Customer." });
  }

  /* ================= FETCH VENDER ================= */

  const vender = await Vender.findById(venderId).populate("user");
  if (!vender) {
    return res.status(400).json({ success: false, message: "Vendor not found" });
  }

  const vendorUser = vender.user;

  // Use vendor location if set, otherwise fallback to drop location for testing/prototype
  const pickupLocation = vendorUser?.location || {
    address: "Default Vendor Location",
    latitude: dropLocation.latitude,
    longitude: dropLocation.longitude
  };

  /* ================= VALIDATE DISHES ================= */

  const dishIds = cartItems.map((item) => item.dishId);

  const dishes = await Dish.find({
    _id: { $in: dishIds },
    vender: venderId,
  });

  if (dishes.length !== cartItems.length) {
    return res.status(400).json({
      success: false,
      message: "Some dishes are invalid for this vendor",
    });
  }

  /* ================= BILL CALCULATION ================= */

  let cartTotal = 0;

  cartItems.forEach((item) => {
    cartTotal += item.price * item.quantity;
  });

  const GST_RATE = 0.05;
  const gstAmount = Math.ceil(cartTotal * GST_RATE);
  const grandTotal = Math.ceil(cartTotal + gstAmount);

  /* ================= DISTANCE CALCULATION ================= */

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceKm = Number(
    getDistanceKm(
      pickupLocation.latitude,
      pickupLocation.longitude,
      dropLocation.latitude,
      dropLocation.longitude
    ).toFixed(2)
  );

  const estimatedTimeMin = Math.ceil(distanceKm * 4); // approx 4 min per km

  /* ================= CREATE GEO SNAPSHOT ================= */

  const createLocationSnapshot = (loc) => ({
    address: loc.address || "",
    latitude: loc.latitude,
    longitude: loc.longitude,
    geo: {
      type: "Point",
      coordinates: [loc.longitude, loc.latitude],
    },
  });

  /* ================= CREATE ORDER ================= */

  const order = await Orders.create({
    customer: customerDoc._id,
    restaurant: venderId,
    deliveryDetails: {
      pickup: createLocationSnapshot(pickupLocation),
      drop: createLocationSnapshot(dropLocation),
      distanceKm,
      estimatedTimeMin,
    },
    cartItems,
    bill: {
      cartTotal,
      gstAmount,
      grandTotal,
    },
    currentStatus: "Placed",
  });

  // Push order to vendor
  vender.orders.push(order._id);
  await vender.save();

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    order,
  });
});
/* ================== UPDATE VENDER PROFILE ================== */
export const updateVenderProfile = asyncHandler(async (req, res, next) => {
  const updates = req.body;

  const vender = await Vender.findOneAndUpdate(
    { user: req._id },
    updates,
    { new: true }
  );

  if (!vender) return res.status(404).json({ message: "Vender not found" });

  res.json({ message: "Profile updated", vender });
});

/* ================== ADD DISH ================== */
export const addDish = asyncHandler(async (req, res, next) => {
  const { name, price, imageUrl } = req.body;

  const dish = await Dish.create({
    vender: req._id,
    name,
    price,
    imageUrl,
  });

  res.status(201).json({ message: "Dish added", dish });
});

/* ================== UPDATE DISH ================== */
export const updateDish = asyncHandler(async (req, res, next) => {
  const { dishId } = req.params;
  const updates = req.body;

  const dish = await Dish.findOneAndUpdate(
    { _id: dishId, vender: req._id },
    updates,
    { new: true }
  );

  if (!dish) return res.status(404).json({ message: "Dish not found" });

  res.json({ message: "Dish updated", dish });
});

/* ================== DELETE DISH ================== */
export const deleteDish = asyncHandler(async (req, res, next) => {
  const { dishId } = req.params;

  const dish = await Dish.findOneAndDelete({ _id: dishId, vender: req._id });
  if (!dish) return res.status(404).json({ message: "Dish not found" });

  res.json({ message: "Dish deleted" });
});

/* ================== GET MY ORDERS ================== */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ message: "Vender not found" });

  const orders = await Orders.find({ restaurant: vender._id })
    .populate("customer", "userId")
    .sort({ createdAt: -1 })
    .lean();

  res.json(orders);
});

/* ================== UPDATE ORDER STATUS ================== */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ message: "Vender not found" });

  const order = await Orders.findOne({ _id: orderId, restaurant: vender._id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.currentStatus = status;
  await order.save();

  res.json({ message: "Order status updated", order });
});

/* ================== CALCULATE EARNINGS ================== */
export const calculateEarnings = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id }).populate("orders");
  if (!vender) return res.status(404).json({ message: "Vender not found" });

  let today = 0, thisWeek = 0, thisMonth = 0, total = 0;
  const now = new Date();

  vender.orders.forEach(order => {
    if (order.currentStatus === "Delivered") {
      total += order.bill.grandTotal;

      const orderDate = new Date(order.createdAt);
      if (orderDate.toDateString() === now.toDateString()) today += order.bill.grandTotal;
      if (orderDate.getWeek() === now.getWeek() && orderDate.getFullYear() === now.getFullYear())
        thisWeek += order.bill.grandTotal;
      if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear())
        thisMonth += order.bill.grandTotal;
    }
  });

  vender.earnings = { today, thisWeek, thisMonth, total };
  await vender.save();

  res.json({ message: "Earnings updated", earnings: vender.earnings });
});

/* ================== TOGGLE AVAILABILITY ================== */
export const toggleAvailability = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ message: "Vender not found" });

  vender.isActive = !vender.isActive;
  await vender.save();

  res.json({ message: `Vender is now ${vender.isActive ? "active" : "inactive"}`, isActive: vender.isActive });
});


export const getNearbyVenders = asyncHandler(async (req, res, next) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "Latitude and Longitude are required",
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: "Invalid coordinates",
    });
  }

  // Step 1: Find nearby vendor users
  const nearbyVendorUsers = await User.find({
    role: "Vender",
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude], // [lng, lat]
        },
        $maxDistance: 5000, // 5 KM
      },
    },
  }).select("_id fullName contact location");

  const vendorUserIds = nearbyVendorUsers.map(user => user._id);

  // Step 2: Get vendor details
  const vendors = await Vender.find({
    user: { $in: vendorUserIds },
    isActive: true,
  })
    .populate("user", "fullName contact location")
    .lean();

  res.status(200).json({
    success: true,
    count: vendors.length,
    vendors,
  });
});

/* ================== GET ALL VENDERS ================== */
export const getAllVenders = asyncHandler(async (req, res, next) => {
  const vendors = await Vender.find({ isActive: true })
    .populate("user", "fullName contact location email")
    .lean();

  res.status(200).json({
    success: true,
    count: vendors.length,
    vendors,
  });
});

/* ================== GET VENDER BY ID ================== */
export const getVenderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const vender = await Vender.findById(id)
    .populate("user", "fullName email contact location")
    .lean();

  if (!vender) return res.status(404).json({ success: false, message: "Vender not found" });

  res.status(200).json({ success: true, vender });
});
