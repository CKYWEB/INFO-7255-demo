import express, { RequestHandler } from "express";
import { createFood, deleteFood, getAllFoods, getFoodById } from "@/controllers/food";
import {noPayload} from "@/middleware";

const router = express.Router();
const handleMethodNotAllowed: RequestHandler = async (_, res) => {
  res.status(405).end();
}

router.get("/", noPayload, getAllFoods);
router.get("/:id", noPayload, getFoodById);
router.post("/", createFood);
router.delete("/:id", deleteFood);
router.all("/", handleMethodNotAllowed);

export default router;