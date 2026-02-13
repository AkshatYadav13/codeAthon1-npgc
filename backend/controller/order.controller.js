import { Orders } from "../models/order.model.js";
import { Vender } from "../models/vender.model.js";
import { Customer } from "../models/customer.model.js";
import { User } from "../models/user.model.js";

/* ================== CREATE ORDER ================== */
export const createOrder = async (req, res) => {
  try {
    const { customerId, restaurantId, cartItems, deliveryDetails, bill } = req.body;

    const order = await Orders.create({
      customer: customerId,
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

    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET ORDER BY ID ================== */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Orders.findById(orderId)
      .populate("customer", "userId")
      .populate("restaurant", "user")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
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

    const order = await Orders.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.currentStatus = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== CANCEL ORDER ================== */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, cancelBy } = req.body; // cancelBy: 'Customer' or 'Restaurant_Owner'

    const order = await Orders.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.currentStatus === "Delivered" || order.currentStatus === "Canceled") {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    order.currentStatus = "Canceled";
    order.cancellationDetails = {
      cancelBy,
      reason,
      userType: cancelBy,
    };

    await order.save();
    res.json({ message: "Order canceled", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




/* ============================================================
   CUSTOMER: GET ALL ORDERS
============================================================ */
export const getAllCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.userId; // from auth middleware

    const orders = await Orders.find({ customer: customerId })
      .populate("restaurant", "shopName contactNumber")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getAllCustomerOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============================================================
   CUSTOMER: GET ACTIVE ORDERS
   (All except Delivered & Canceled)
============================================================ */
export const getCustomerActiveOrders = async (req, res) => {
  try {
    const customerId = req.user.userId;

    const orders = await Orders.find({
      customer: customerId,
      currentStatus: { $nin: ["Delivered", "Canceled"] },
      isActive: true,
    })
      .populate("restaurant", "shopName contactNumber")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      activeOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getCustomerActiveOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============================================================
   VENDER: GET ALL ORDERS
============================================================ */
export const getAllVenderOrders = async (req, res) => {
  try {
    const venderId = req.user.userId;

    const orders = await Orders.find({ restaurant: venderId })
      .populate("customer", "fullName contact")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getAllVenderOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============================================================
   VENDER: GET ACTIVE ORDERS
   (Orders still in process)
============================================================ */
export const getVenderActiveOrders = async (req, res) => {
  try {
    const venderId = req.user.userId;

    const orders = await Orders.find({
      restaurant: venderId,
      currentStatus: { $nin: ["Delivered", "Canceled"] },
      isActive: true,
    })
      .populate("customer", "fullName contact")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      activeOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getVenderActiveOrders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================== GET ORDERS BY CUSTOMER ================== */
export const getOrdersByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const orders = await Orders.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET ORDERS BY VENDER ================== */
export const getOrdersByVender = async (req, res) => {
  try {
    const venderId = req.params.venderId;

    const orders = await Orders.find({ restaurant: venderId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


