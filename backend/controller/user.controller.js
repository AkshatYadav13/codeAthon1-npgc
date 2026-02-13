import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Customer } from "../models/customer.model.js";
import { Vender } from "../models/vender.model.js";
import { getJwtToken } from "../utils/getJwtToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================== ENV VARIABLES ================== */
const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET_KEY is not defined in environment variables");
}
const JWT_EXPIRES_IN = "7d"; // token expires in 7 days

/* ================== REGISTER USER ================== */
export const signup = asyncHandler(async (req, res) => {
    const { fullName, email, password, contact, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { contact }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      contact,
      role,
    });

    getJwtToken(res, user._id);

    // Create role-specific document
    if (role === "Customer") {
      await Customer.create({ userId: user._id });
    } else if (role === "Vender") {
      await Vender.create({ user: user._id });
    }

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      role: user.role,
    });
});

/* ================== LOGIN USER ================== */
export const login = asyncHandler(async (req, res) => {
  const { email, contact, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  let user;

  // If email is provided → Customer login
  if (email) {
    user = await User.findOne({ email, role: "Customer" }).select("+password");
  }

  // If contact (phone number) is provided → Vender login
  else if (contact) {
    user = await User.findOne({ contact, role: "Vender" }).select("+password");
  }

  else {
    return res.status(400).json({
      message: "Provide email (Customer) or contact (Vender)",
    });
  }

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT
  getJwtToken(res, user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    userId: user._id,
    role: user.role,
  });
});


export const logout = asyncHandler(async (req, res) => {
    // Note: req.id was used in original code, but usually it's req._id or req.user.id
    // Assuming req.id or similar. The original code had `req.id` but `isAuthenticated` sets `req._id`.
    // I will check middlewares.js to be sure. 
    // IsAuthenticated sets `req._id`.
    
    // Original code: const user = (await User.findById(req.id)) 
    // It should be req._id based on middlewares.js
    const user = await User.findById(req._id);

    if (!user) {
      return res.status(400).json({ message: `User not found`, success: false });
    }

    res.clearCookie("token").json({
      message: "Logged out successfully",
      success: true,
    });
});

/* ================== GET USER PROFILE ================== */
export const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req._id; // req.user set by auth middleware

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Include role-specific info
    if (user.role === "Customer") {
      const customer = await Customer.findOne({ userId: user._id });
      user.customerId = customer?._id;
    } else if (user.role === "Vender") {
      const vender = await Vender.findOne({ user: user._id });
      user.venderId = vender?._id;
    }

    res.json(user);
});

/* ================== UPDATE USER PROFILE ================== */
export const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req._id; // Changed from req.user.userId to req._id based on middleware
    const updates = req.body;

    // Prevent role change
    if (updates.role) delete updates.role;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();
    res.json({ message: "Profile updated", user });
});

/* ================== CHANGE PASSWORD ================== */
export const changePassword = asyncHandler(async (req, res) => {
    const userId = req._id; // Changed from req.user.userId to req._id based on middleware
    const { oldPassword, newPassword } = req.body;

    // Find user including password
    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
});


export const setUserLocation = asyncHandler(async (req, res) => {
  const userId = req.user._id; // from isAuthenticated middleware
  const { latitude, longitude, address } = req.body;

  // Validate required fields
  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: "Latitude and Longitude are required",
    });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      message: "Invalid latitude or longitude",
    });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: "Coordinates out of range",
    });
  }

  // Update location
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      location: {
        address: address || undefined, // optional
        latitude: lat,
        longitude: lng,
        geo: {
          type: "Point",
          coordinates: [lng, lat], // IMPORTANT → [longitude, latitude]
        },
      },
    },
    { new: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Location updated successfully",
    location: updatedUser.location,
  });
});

