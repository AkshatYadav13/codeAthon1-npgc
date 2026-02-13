import express from "express";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrdersByCustomer,
  getOrdersByVender,
  getAllCustomerOrders,
  getCustomerActiveOrders,
  getAllVenderOrders,
  getVenderActiveOrders,
  // assignDeliveryAgent
} from "../controller/order.controller.js";

import { isAuthenticated } from "../middlewares.js";

const router = express.Router();

/* ================= DASHBOARD ROUTES ================= */

// Customer dashboard
router.get("/customer/all", isAuthenticated, getAllCustomerOrders);
router.get("/customer/active", isAuthenticated, getCustomerActiveOrders);

// Vendor dashboard
router.get("/vender/all", isAuthenticated, getAllVenderOrders);
router.get("/vender/active", isAuthenticated, getVenderActiveOrders);

// Orders by ID (admin style)
router.get("/customer/:customerId", isAuthenticated, getOrdersByCustomer);
router.get("/vender/:venderId", isAuthenticated, getOrdersByVender);

/* ================= ORDER ACTIONS ================= */

router.post("/", isAuthenticated, createOrder);
router.put("/:orderId/status", isAuthenticated, updateOrderStatus);
router.put("/:orderId/cancel", isAuthenticated, cancelOrder);
// router.put("/:orderId/assign-agent", isAuthenticated, assignDeliveryAgent);

export default router;
