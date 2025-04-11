import express from "express";
import { searchPlansByQuery, getPlanServices } from "@/controllers/search";
import { verifyToken } from "@/middleware";

const router = express.Router();

router.use(verifyToken); // Apply authentication to all search routes

// Search plans by query
router.get("/plans", searchPlansByQuery);

// Get services by plan ID
router.get("/plans/:planId/services", getPlanServices);

export default router;