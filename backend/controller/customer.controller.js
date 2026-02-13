import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";
import { Vender } from "../models/vender.model.js";
import { Orders } from "../models/order.model.js";

/* ================== GET CUSTOMER PROFILE ================== */
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.userId })
      .populate("userId", "fullName email contact location")
      .lean();

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== UPDATE CUSTOMER PROFILE ================== */
export const updateCustomerProfile = async (req, res) => {
  try {
    const updates = req.body;

    const customer = await Customer.findOne({ userId: req.user.userId });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Update User fields like fullName, contact, location
    const user = await User.findByIdAndUpdate(customer.userId, updates, { new: true });

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET NEARBY VENDORS ================== */
export const getNearbyVenders = async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 5 } = req.query; // radius in km

    // Geo query to find nearby vendors
    const venders = await Vender.find({
      isActive: true,
      "user.location.geo": {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radiusKm * 1000, // meters
        },
      },
    }).populate("user", "fullName contact location").lean();

    res.json(venders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== PLACE ORDER ================== */
export const placeOrder = async (req, res) => {
  try {
    const { restaurantId, cartItems, deliveryDetails, bill } = req.body;

    const order = await Orders.create({
      customer: req.user.userId,
      restaurant: restaurantId,
      cartItems,
      deliveryDetails,
      bill,
      currentStatus: "Placed",
    });

    // Add order to vendor
    const vender = await Vender.findOne({ user: restaurantId });
    if (vender) {
      vender.orders.push(order._id);
      await vender.save();
    }

    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== TRACK ORDER ================== */
export const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Orders.findOne({ _id: orderId, customer: req.user.userId }).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== RATE ORDER ================== */
export const rateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { restaurantRating, foodRating, deliveryRating } = req.body;

    const order = await Orders.findOne({ _id: orderId, customer: req.user.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.ratingDetails = {
      restaurant: restaurantRating,
      food: foodRating,
      deliveryAgent: deliveryRating,
    };
    await order.save();

    // Update vendor average rating
    const vender = await Vender.findOne({ user: order.restaurant });
    if (vender) {
      vender.ratingTotal += restaurantRating;
      vender.ratingCount += 1;
      vender.avgRating = vender.ratingTotal / vender.ratingCount;
      await vender.save();
    }

    res.json({ message: "Order rated successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET ORDER HISTORY ================== */
export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Orders.find({ customer: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== CANCEL ORDER ================== */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Orders.findOne({ _id: orderId, customer: req.user.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.currentStatus === "Delivered" || order.currentStatus === "Canceled") {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    order.currentStatus = "Canceled";
    order.cancellationDetails = {
      cancelBy: req.user.userId,
      reason,
      userType: "Customer",
    };

    await order.save();
    res.json({ message: "Order canceled", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


