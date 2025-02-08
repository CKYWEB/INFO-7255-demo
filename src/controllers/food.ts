import { RequestHandler } from "express";
import { handleCreateFood, handleGetAllFoods, handleGetFoodById, handleDeleteFood } from "@/services/food";
import { foodSchema } from "@/validations/foodSchema";
import { validate } from "jsonschema";
import etag from "etag";

export const createFood: RequestHandler = async (req, res) => {
  const validation = validate(req.body, foodSchema);

  if (!validation.valid) {
    res.status(400).json({ errors: validation.errors.map(err => err.stack) });

    return;
  }

  try {
    const food = await handleCreateFood(req.body.name);

    res.status(201).json(food);
  } catch (error) {
    res.status(503).end();
  }

};

export const getAllFoods: RequestHandler = async (req, res) => {
  try {
    const foods = await handleGetAllFoods();
    const responseJSON = JSON.stringify(foods);
    const eTag = etag(responseJSON);

    if (`"${req.headers["if-none-match"]}"` === eTag) {
      res.status(304).end();

      return;
    }

    res.set("ETag", eTag).json(foods);
  } catch (error) {
    res.status(503).end();
  }
};

export const getFoodById: RequestHandler = async (req, res) => {
  try {
    const food = await handleGetFoodById(req.params.id);

    if (!food) {
      res.status(404).json({message: "Food not found"});

      return;
    }

    const responseJSON = JSON.stringify(food);
    const eTag = etag(responseJSON);

    if (req.headers["if-none-match"] === eTag) {
      res.status(304).end();

      return;
    }

    res.set("ETag", eTag).json(food);
  } catch (error) {
    res.status(503).end();
  }
};

export const deleteFood: RequestHandler = async (req, res) => {
  try {
    const food = await handleDeleteFood(req.params.id);
    if (!food) {
      res.status(404).json({message: "Food not found"});

      return;
    }

    res.status(204).end();
  } catch (error) {
    res.status(503).end();
  }
};