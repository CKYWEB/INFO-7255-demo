import express from "express";
import { createFood, deleteFood, getAllFoods, getFoodById } from "@/controllers/food";

const router = express.Router();

router.get("/", getAllFoods);
router.get("/:id", getFoodById);
router.post("/", createFood);
router.delete("/:id", deleteFood);

export default router;