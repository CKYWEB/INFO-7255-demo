import { RequestHandler } from "express";
import { handleCreatePlan, handleGetPlanById, handleDeletePlan, handleUpdatePlan } from "@/services/plan";
import { planSchema } from "@/validations/planSchema";
import { validate } from "jsonschema";
import etag from "etag";

export const createPlan: RequestHandler = async (req, res) => {
  const validation = validate(req.body, planSchema);

  if (!validation.valid) {
    res.status(400).json({ errors: validation.errors.map(err => err.stack) });

    return;
  }

  try {
    const plan = await handleCreatePlan(req.body);

    res.status(201).json(plan);
  } catch (error) {
    console.log(error);

    if ((error as Error).message === "Duplicate plan data") {
      res.status(409).end();
    }

    res.status(503).end();
  }
};

export const getPlan: RequestHandler = async (req, res) => {
  let eTagHash;

  try {
    if (req.params.id === undefined || req.params.id === null) {
      eTagHash = await handleGetPlanById();
    } else {
      eTagHash = await handleGetPlanById(req.params.id);
    }


    if (!eTagHash) {
      res.status(404).json({message: "Plan not found"});

      return;
    }

    const responseJSON = JSON.stringify(eTagHash);
    const eTag = etag(responseJSON);

    if (req.headers["if-none-match"] === eTag) {
      res.status(304).end();

      return;
    }

    res.set("ETag", eTag).json(eTagHash);
  } catch (error) {
    console.log(error);
    res.status(503).end();
  }
};

export const deletePlan: RequestHandler = async (req, res) => {
  try {
    const plan = await handleDeletePlan(req.params.id);

    if (!plan) {
      res.status(404).json({ message: "Plan not found" });

      return;
    }

    res.status(204).end();
  } catch (error) {
    console.log(error);
    res.status(503).end();
  }
};

export const updatePlan: RequestHandler = async (req, res) => {
  const validation = validate(req.body, planSchema);

  if (!validation.valid) {
    res.status(400).json({ errors: validation.errors.map(err => err.stack) });
    
    return;
  }

  try {
    const currentPlan = await handleGetPlanById(req.params.id);
    
    if (!currentPlan) {
      res.status(404).json({ message: "Plan not found" });

      return;
    }
    
    const currentETag = etag(JSON.stringify(currentPlan));
    
    if (req.headers['if-match'] && req.headers['if-match'] !== currentETag) {
      res.status(412).json({ 
        message: "Precondition Failed: Plan has been modified since last retrieval"
      });
      
      return;
    }
    
    const updatedPlan = await handleUpdatePlan(req.params.id, req.body);
    const newETag = etag(JSON.stringify(updatedPlan));
    
    res.set("ETag", newETag).json(updatedPlan);
  } catch (error) {
    console.error(error);
    res.status(503).end();
  }
};