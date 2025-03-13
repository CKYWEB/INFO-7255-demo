import dotenv from "dotenv";

dotenv.config();

export const authConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_CLIENT_SECRET",
  redirectUri: process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback",
};
