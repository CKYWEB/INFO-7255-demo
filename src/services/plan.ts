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
  
  function handleObjectIdChanges(original: any, updated: any): any {
    if (original instanceof Object && updated instanceof Object && 
        !(original instanceof Array) && !(updated instanceof Array)) {
      for (const [key, value] of Object.entries(updated)) {
        if (key === "objectId" && key in original && original[key] !== value) {
          original[key] = value;
        } else if (key in original) {
          original[key] = handleObjectIdChanges(original[key], value);
        } else {
          original[key] = value;
        }
      }
      return original;
    } else if (original instanceof Array && updated instanceof Array) {
      for (const updatedItem of updated) {
        if (updatedItem instanceof Object && "objectId" in updatedItem) {
          const existingItem = original.find(
            (item: any) => item.objectId === updatedItem.objectId
          );
          
          if (existingItem) {
            handleObjectIdChanges(existingItem, updatedItem);
          } else {
            original.push(updatedItem);
          }
        }
      }
      return original;
    } else {
      return updated;
    }
  }
  
  handleObjectIdChanges(plan, updateData);
  
  return await plan.save();
};