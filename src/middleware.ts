import type { RequestHandler } from "express";

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