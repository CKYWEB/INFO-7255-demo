import { RequestHandler } from "express";
import { searchPlans, searchPlansByServiceName } from "@/services/elastic";

export const searchPlansByQuery: RequestHandler = async (req, res) => {
  try {
    const query = req.body.query || {
      query: {
        match_all: {}
      }
    };

    const results = await searchPlans(query);

    res.json({
      count: results.length,
      results
    });
  } catch (error) {
    console.error("Error searching plans:", error);
    res.status(503).json({ message: "Search service unavailable" });
  }
};

export const searchPlansByService: RequestHandler = async (req, res) => {
  try {
    const serviceName = req.query.name as string;

    if (!serviceName) {
      res.status(400).json({ message: "Service name is required" });
      return;
    }

    // Use the dedicated function for searching by service name using parent-child
    const results = await searchPlansByServiceName(serviceName);

    res.json({
      count: results.length,
      results
    });
  } catch (error) {
    console.error("Error searching plans by service:", error);
    res.status(503).json({ message: "Search service unavailable" });
  }
};