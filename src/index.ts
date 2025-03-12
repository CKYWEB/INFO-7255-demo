import express from "express";
import planroutes from "@/routes/plan";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", planroutes);

mongoose
  .connect("mongodb://localhost:27017/plan")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB Connection Error:", err));