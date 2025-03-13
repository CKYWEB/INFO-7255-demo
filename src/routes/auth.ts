import express from "express";
import { authConfig } from "@/config/auth";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const oAuth2Client = new OAuth2Client(
  authConfig.clientId,
  authConfig.clientSecret,
  authConfig.redirectUri
);

router.get("/authorize", (_, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    scope: ['profile', 'email'],
  });
  
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    const { tokens } = await oAuth2Client.getToken(code);
    
    res.json({ 
      token: tokens.id_token,
      expiresIn: tokens.expiry_date,
      tokenType: 'Bearer'
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

export default router;