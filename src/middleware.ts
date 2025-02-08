import type { RequestHandler } from "express";
import { validationResult } from "express-validator";

export const noPayload: RequestHandler = (req, res, next) => {
  const query = req.query as Record<string, unknown>;
  const body = req.body as Record<string, unknown>;

  if (
    (query && Object.keys(query).length > 0) ||
    (body && Object.keys(body).length > 0)
  ) {
    res.status(400).end();

    return;
  }

  next();
}

export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });

    return;
  }

  next();
};

