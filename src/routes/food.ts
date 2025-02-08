import express from "express";
import { createFood, deleteFood, getAllFoods, getFoodById } from "@/controllers/food";
import {noPayload} from "@/middleware";

const router = express.Router();

router.get("/", noPayload, getAllFoods);
router.get("/:id", noPayload, getFoodById);
router.post("/", createFood);
router.delete("/:id", deleteFood);

export default router;