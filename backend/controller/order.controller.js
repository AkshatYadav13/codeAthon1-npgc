/* ================== CREATE ORDER ================== */
import { Orders } from "../models/order.model.js";
import { Vender } from "../models/vender.model.js";
import { User } from "../models/user.model.js";
import { Dish } from "../models/dish.model.js";

export const createOrder = async (req, res) => {
  try {
    const { venderId, cartItems, dropLocation } = req.body;
    const customerId = req._id;

    /* ================= VALIDATION ================= */

    if (!venderId) {
      return res.status(400).json({ message: "Restaurant ID required" });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart cannot be empty" });
    }

    if (
      !dropLocation ||
      typeof dropLocation.latitude !== "number" ||
      typeof dropLocation.longitude !== "number"
    ) {
      return res.status(400).json({
        message: "Customer drop location (lat,lng) required",
      });
    }

    /* ================= FETCH CUSTOMER ================= */

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    /* ================= FETCH VENDER ================= */

    const vender = await Vender.findById(venderId).populate("user");
    if (!vender) {
      return res.status(400).json({ message: "Vendor not found" });
    }

    const vendorUser = vender.user;

    if (!vendorUser?.location) {
      return res.status(400).json({ message: "Vendor location not set" });
    }

    const pickupLocation = vendorUser.location;

    /* ================= VALIDATE DISHES ================= */

    const dishIds = cartItems.map((item) => item.dishId);

    const dishes = await Dish.find({
      _id: { $in: dishIds },
      vender: restaurantId,
    });

    if (dishes.length !== cartItems.length) {
      return res.status(400).json({
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
      customer: customerId,
      restaurant: restaurantId,
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
  } catch (error) {
    console.error("Create order error:", error);
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
    const customerId = req._id;

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


