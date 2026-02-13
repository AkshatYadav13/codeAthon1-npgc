import express from "express";
import { signup, login, logout, getUserProfile, updateUserProfile, changePassword, setUserLocation } from "../controller/user.controller.js";
import { isAuthenticated } from "../middlewares.js";

const router = express.Router();

// Auth
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, updateUserProfile);
router.put("/change-password", isAuthenticated, changePassword);
router.get("/logout", isAuthenticated, logout);
router.put("/set/user/location", isAuthenticated, setUserLocation);

export default router;
