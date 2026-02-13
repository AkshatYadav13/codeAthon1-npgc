import express from "express";
import {
  getVenderProfile,
  updateVenderProfile,
  addDish,
  updateDish,
  deleteDish,
  getMyOrders,
  updateOrderStatus,
  calculateEarnings,
  toggleAvailability,
  getNearbyVenders,
  getAllVenders,
  getVenderById,
  createOrder,
  updateVenderLiveLocation
} from "../controller/vender.controller.js";
import { isAuthenticated } from "../middlewares.js";

const router = express.Router();

// Public routes
router.get("/all", getAllVenders);
router.get("/:id", getVenderById);
router.post("/order", isAuthenticated, createOrder);

// Vendor profile
router.get("/profile", isAuthenticated, getVenderProfile);
router.put("/profile", isAuthenticated, updateVenderProfile);

// Dish management
router.post("/dish", isAuthenticated, addDish);
router.put("/dish/:dishId", isAuthenticated, updateDish);
router.delete("/dish/:dishId", isAuthenticated, deleteDish);

// Orders
router.get("/orders", isAuthenticated, getMyOrders);
router.put("/orders/:orderId/status", isAuthenticated, updateOrderStatus);

// Earnings & Availability
router.get("/earnings", isAuthenticated, calculateEarnings);
router.put("/toggle-availability", isAuthenticated, toggleAvailability);
router.get("/near/vender", isAuthenticated, getNearbyVenders);
router.patch("/update-location", isAuthenticated, updateVenderLiveLocation);

export default router;
