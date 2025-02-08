import {body} from "express-validator";

export const createFoodValidator = [
  body("name")
    .notEmpty()
    .withMessage("Food name is required")
    .isString()
    .withMessage("Food name must be a string"),
];