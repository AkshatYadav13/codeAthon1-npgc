import { Dish } from "../models/dish.model.js";
import { Vender } from "../models/vender.model.js";
import { uploadImageOnCloundinary } from "../cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ================== ADD DISH ================== */
export const addDish = asyncHandler(async (req, res, next) => {
  const { name, price, description, category } = req.body;
  const file = req.file;

  if (!name || !price || !description || !category) {
    return res.status(400).json({ success: false, message: "All fields except image are required" });
  }

  // Find the vendor profile for this user
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) {
    return res.status(404).json({ success: false, message: "Vendor profile not found" });
  }

  let imageUrl = "";
  if (file) {
    imageUrl = await uploadImageOnCloundinary(file);
  }

  const dish = await Dish.create({
    vender: vender._id, // Use Vender ID, not User ID
    name,
    description,
    price,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=60",
    category,
  });

  res.status(201).json({ success: true, message: "Dish added successfully", dish });
});

/* ================== UPDATE DISH ================== */
export const updateDish = asyncHandler(async (req, res, next) => {
  const { dishId } = req.params;
  const updates = req.body;

  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ message: "Vendor profile not found" });

  const dish = await Dish.findOneAndUpdate(
    { _id: dishId, vender: vender._id },
    updates,
    { new: true }
  );

  if (!dish) return res.status(404).json({ message: "Dish not found" });

  res.json({ message: "Dish updated", dish });
});

/* ================== DELETE DISH ================== */
export const deleteDish = asyncHandler(async (req, res, next) => {
  const { dishId } = req.params;

  const vender = await Vender.findOne({ user: req._id });
  if (!vender) return res.status(404).json({ message: "Vendor profile not found" });

  const dish = await Dish.findOneAndDelete({ _id: dishId, vender: vender._id });
  if (!dish) return res.status(404).json({ message: "Dish not found" });

  res.json({ message: "Dish deleted" });
});

/* ================== GET MY DISHES (VENDOR) ================== */
export const getMyDishes = asyncHandler(async (req, res, next) => {
  const vender = await Vender.findOne({ user: req._id });
  if (!vender) {
    return res.status(404).json({ success: false, message: "Vendor profile not found" });
  }

  const dishes = await Dish.find({ vender: vender._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, dishes });
});

/* ================== GET ALL DISHES (CUSTOMER) ================== */
export const getAllDishes = asyncHandler(async (req, res, next) => {
  const dishes = await Dish.find({}).populate("vender", "user").lean();
  res.json(dishes);
});

/* ================== GET DISH BY ID ================== */
export const getDishById = asyncHandler(async (req, res, next) => {
  const { dishId } = req.params;
  const dish = await Dish.findById(dishId).populate("vender", "user").lean();

  if (!dish) return res.status(404).json({ message: "Dish not found" });
  res.json(dish);
});

/* ================== GET DISHES BY TYPE ================== */
export const getDishesByType = asyncHandler(async (req, res, next) => {
  const { type } = req.query; // e.g., Vegetables, Fruits, Both
  const dishes = await Dish.find({ foodType: type }).lean();
  res.json(dishes);
});

/* ================== SEARCH DISHES ================== */
export const searchDishes = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  const dishes = await Dish.find({
    name: { $regex: query, $options: "i" },
  }).lean();

  res.json(dishes);
});

/* ================== GET DISHES BY VENDOR ================== */
export const getDishesByVendor = asyncHandler(async (req, res, next) => {
  const { venderId } = req.params;
  const dishes = await Dish.find({ vender: venderId }).lean();
  res.status(200).json({ success: true, dishes });
});
