import mongoose from "mongoose";

const CostSharesSchema = new mongoose.Schema({
  deductible: { type: Number, required: true },
  _org: { type: String, required: true },
  copay: { type: Number, required: true },
  objectId: { type: String, required: true },
  objectType: { type: String, required: true }
});

const LinkedServiceSchema = new mongoose.Schema({
  _org: { type: String, required: true },
  objectId: { type: String, required: true },
  objectType: { type: String, required: true },
  name: { type: String, required: true }
});

const PlanServiceSchema = new mongoose.Schema({
  linkedService: { type: LinkedServiceSchema, required: true },
  planserviceCostShares: { type: CostSharesSchema, required: true },
  _org: { type: String, required: true },
  objectId: { type: String, required: true },
  objectType: { type: String, required: true }
});

const PlanSchema = new mongoose.Schema({
  planCostShares: { type: CostSharesSchema, required: true },
  linkedPlanServices: { type: [PlanServiceSchema], required: true },
  _org: { type: String, required: true },
  objectId: { type: String, required: true, unique: true },
  objectType: { type: String, required: true },
  planType: { type: String, required: true },
  creationDate: { type: String, required: true }
});

PlanSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Plan", PlanSchema);