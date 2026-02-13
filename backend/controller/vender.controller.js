import { Vender } from "../models/vender.model.js";
import { Orders } from "../models/order.model.js";
import { Dish } from "../models/dish.model.js"; // Assume you have a Dish model
import { User } from "../models/user.model.js";

/* ================== GET VENDER PROFILE ================== */
export const getVenderProfile = async (req, res) => {
  try {
    const vender = await Vender.findOne({ user: req.user.userId })
      .populate("user", "fullName email contact location")
      .populate("orders")
      .lean();

    if (!vender) return res.status(404).json({ message: "Vender not found" });

    res.json(vender);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== UPDATE VENDER PROFILE ================== */
export const updateVenderProfile = async (req, res) => {
  try {
    const updates = req.body;

    const vender = await Vender.findOneAndUpdate(
      { user: req.user.userId },
      updates,
      { new: true }
    );

    if (!vender) return res.status(404).json({ message: "Vender not found" });

    res.json({ message: "Profile updated", vender });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== ADD DISH ================== */
export const addDish = async (req, res) => {
  try {
    const { name, price, imageUrl } = req.body;

    const dish = await Dish.create({
      vender: req.user.userId,
      name,
      price,
      imageUrl,
    });

    res.status(201).json({ message: "Dish added", dish });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== UPDATE DISH ================== */
export const updateDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const updates = req.body;

    const dish = await Dish.findOneAndUpdate(
      { _id: dishId, vender: req.user.userId },
      updates,
      { new: true }
    );

    if (!dish) return res.status(404).json({ message: "Dish not found" });

    res.json({ message: "Dish updated", dish });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== DELETE DISH ================== */
export const deleteDish = async (req, res) => {
  try {
    const { dishId } = req.params;

    const dish = await Dish.findOneAndDelete({ _id: dishId, vender: req.user.userId });
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    res.json({ message: "Dish deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET MY ORDERS ================== */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Orders.find({ restaurant: req.user.userId })
      .populate("customer", "userId")
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== UPDATE ORDER STATUS ================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Orders.findOne({ _id: orderId, restaurant: req.user.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.currentStatus = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== CALCULATE EARNINGS ================== */
export const calculateEarnings = async (req, res) => {
  try {
    const vender = await Vender.findOne({ user: req.user.userId }).populate("orders");
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== TOGGLE AVAILABILITY ================== */
export const toggleAvailability = async (req, res) => {
  try {
    const vender = await Vender.findOne({ user: req.user.userId });
    if (!vender) return res.status(404).json({ message: "Vender not found" });

    vender.isActive = !vender.isActive;
    await vender.save();

    res.json({ message: `Vender is now ${vender.isActive ? "active" : "inactive"}`, isActive: vender.isActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getNearbyVenders = async (req, res) => {
  try {
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

  } catch (error) {
    console.error("getNearbyVenders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

