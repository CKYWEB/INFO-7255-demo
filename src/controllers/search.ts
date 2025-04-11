import { RequestHandler } from "express";
import { searchPlans, getLinkedServices } from "@/services/plan";

export const searchPlansByQuery: RequestHandler = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: "Query parameter is required" });

      return;
    }

    const results = await searchPlans(query);

    res.json(results);
  } catch (error) {
    console.error('Error in search controller:', error);
    res.status(500).json({ message: "Error processing search request" });
  }
};

export const getPlanServices: RequestHandler = async (req, res) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      res.status(400).json({ message: "Plan ID is required" });

      return;
    }

    const services = await getLinkedServices(planId);

    res.json(services);
  } catch (error) {
    console.error('Error getting plan services:', error);
    res.status(500).json({ message: "Error retrieving plan services" });
  }
};