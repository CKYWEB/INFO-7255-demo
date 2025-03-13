import Plan from "@/models/Plan"

export const handleCreatePlan = async (planData: any) => {
  if (await Plan.findOne({ objectId: planData.objectId })) {
    throw new Error("Duplicate plan data");
  }

  return await Plan.create(planData);
};

export const handleGetPlanById = async (objectId?: string) => {
  return objectId ? await Plan.findOne({ objectId }).exec() : await Plan.find({});
};

export const handleDeletePlan = async (objectId: string) => {
  return Plan.findOneAndDelete({objectId});
};

export const handleUpdatePlan = async (objectId: string, updateData: any) => {
  const plan = await Plan.findOne({ objectId });
  
  if (!plan) throw new Error("Plan not found.");
  
  Object.keys(updateData).forEach(key => {
    if (key !== 'objectId') {
      plan.set(key, updateData[key]);
    }
  });
  
  return await plan.save();
};