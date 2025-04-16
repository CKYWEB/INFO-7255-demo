import express from "express";
import planRoutes from "@/routes/plan";
import searchRoutes from "@/routes/search";
import authRoutes from "@/routes/auth";
import mongoose from "mongoose";
import { initializeElasticsearch } from "@/services/elastic";
import { initializeQueue } from "@/services/queue";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/plan";

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/search", searchRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    await initializeElasticsearch();
    await initializeQueue();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
  });