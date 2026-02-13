import express from "express";
import {
  addDish,
  updateDish,
  deleteDish,
  getMyDishes,
  getAllDishes,
  getDishById,
  getDishesByType,
  searchDishes,
  getDishesByVendor
} from "../controller/dish.controller.js";
import { isAuthenticated } from "../middlewares.js";

import upload from "../middlewares.js";

const router = express.Router();

// Vendor dish management
router.get("/my-dishes", isAuthenticated, getMyDishes);
router.post("/", isAuthenticated, upload.single("image"), addDish);
router.put("/:dishId", isAuthenticated, updateDish);
router.delete("/:dishId", isAuthenticated, deleteDish);

// Customer dish browsing
router.get("/", getAllDishes);
router.get("/:dishId", getDishById);
router.get("/vender/:venderId", getDishesByVendor);
router.get("/type/:foodType", getDishesByType);
router.get("/search", searchDishes);

export default router;
