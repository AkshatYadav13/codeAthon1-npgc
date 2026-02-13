import { Dish } from "../models/dish.model.js";
import { Vender } from "../models/vender.model.js";

/* ================== ADD DISH ================== */
export const addDish = async (req, res) => {
  try {
    const { name, price, imageUrl, foodType } = req.body;

    const dish = await Dish.create({
      vender: req.user.userId,
      name,
      price,
      imageUrl,
      foodType,
    });

    res.status(201).json({ message: "Dish added", dish });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== UPDATE DISH ================== */
export const updateDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    const updates = req.body;

    const dish = await Dish.findOneAndUpdate(
      { _id: dishId, vender: req.user.userId },
      updates,
      { new: true }
    );

    if (!dish) return res.status(404).json({ message: "Dish not found" });

    res.json({ message: "Dish updated", dish });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== DELETE DISH ================== */
export const deleteDish = async (req, res) => {
  try {
    const { dishId } = req.params;

    const dish = await Dish.findOneAndDelete({ _id: dishId, vender: req.user.userId });
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    res.json({ message: "Dish deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET MY DISHES (VENDOR) ================== */
export const getMyDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({ vender: req.user.userId }).sort({ createdAt: -1 }).lean();
    res.json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET ALL DISHES (CUSTOMER) ================== */
export const getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({}).populate("vender", "user").lean();
    res.json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET DISH BY ID ================== */
export const getDishById = async (req, res) => {
  try {
    const { dishId } = req.params;
    const dish = await Dish.findById(dishId).populate("vender", "user").lean();

    if (!dish) return res.status(404).json({ message: "Dish not found" });
    res.json(dish);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== GET DISHES BY TYPE ================== */
export const getDishesByType = async (req, res) => {
  try {
    const { type } = req.query; // e.g., Vegetables, Fruits, Both
    const dishes = await Dish.find({ foodType: type }).lean();
    res.json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================== SEARCH DISHES ================== */
export const searchDishes = async (req, res) => {
  try {
    const { query } = req.query;
    const dishes = await Dish.find({
      name: { $regex: query, $options: "i" },
    }).lean();

    res.json(dishes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
