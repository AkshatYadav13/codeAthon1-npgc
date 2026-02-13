import express from "express";
import {
  addDish,
  updateDish,
  deleteDish,
  getMyDishes,
  getAllDishes,
  getDishById,
  getDishesByType,
  searchDishes
} from "../controller/dish.controller.js";
import { isAuthenticated } from "../middlewares.js";

const router = express.Router();

// Vendor dish management
router.get("/my-dishes", isAuthenticated, getMyDishes);
router.post("/", isAuthenticated, addDish);
router.put("/:dishId", isAuthenticated, updateDish);
router.delete("/:dishId", isAuthenticated, deleteDish);

// Customer dish browsing
router.get("/", getAllDishes);
router.get("/:dishId", getDishById);
router.get("/type/:foodType", getDishesByType);
router.get("/search", searchDishes);

export default router;
