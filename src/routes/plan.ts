import express, { RequestHandler } from "express";
import { createPlan, deletePlan, getPlan } from "@/controllers/plan";
import { noPayload, verifyToken } from "@/middleware";

const router = express.Router();
const handleMethodNotAllowed: RequestHandler = async (_, res) => {
  res.status(405).end();
}

router.use(verifyToken);
router.get("/", noPayload, getPlan);
router.get("/:id", noPayload, getPlan);
router.post("/", createPlan);
router.delete("/:id", deletePlan);
router.all("/", handleMethodNotAllowed);

export default router;