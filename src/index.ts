import express from "express";
import planRoutes from "@/routes/plan";
import authRoutes from "@/routes/auth";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);

mongoose
  .connect("mongodb://localhost:27017/plan")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB Connection Error:", err));