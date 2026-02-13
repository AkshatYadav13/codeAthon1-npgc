import express from "express";
import {
  getCustomerProfile,
  updateCustomerProfile,
  getNearbyVenders,
  placeOrder,
  trackOrder,
  rateOrder,
  getOrderHistory,
  cancelOrder
} from "../controller/customer.controller.js";
import { isAuthenticated } from "../middlewares.js";

const router = express.Router();

// Customer profile
router.get("/profile", isAuthenticated, getCustomerProfile);
router.put("/profile", isAuthenticated, updateCustomerProfile);

// Nearby vendors & dishes
router.get("/vendors/nearby", isAuthenticated, getNearbyVenders);

// Orders
router.post("/orders", isAuthenticated, placeOrder);
router.get("/orders/:orderId", isAuthenticated, trackOrder);
router.put("/orders/:orderId/rate", isAuthenticated, rateOrder);
router.get("/orders", isAuthenticated, getOrderHistory);
router.put("/orders/:orderId/cancel", isAuthenticated, cancelOrder);

export default router;
