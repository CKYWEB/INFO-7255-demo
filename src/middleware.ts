import type { RequestHandler } from "express";
import { authConfig } from "@/config/auth";
import { OAuth2Client } from "google-auth-library";

const oAuth2Client = new OAuth2Client(authConfig.clientId);

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

export const verifyToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token not found' });

      return;
    }

    const token = authHeader.split(' ')[1];

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: authConfig.clientId
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      res.status(401).json({ message: 'Invalid token' });
      
      return;
    }

    next();
  } catch (error) {
    console.error('Token failed:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
