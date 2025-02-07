import express from "express";
import foodRoutes from "@/routes/food";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/food", foodRoutes);

mongoose
  .connect("mongodb://localhost:27017/foodLibrary")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(3001, () => console.log("Server running on port 3001"));
  })
  .catch(err => console.error("MongoDB Connection Error:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});