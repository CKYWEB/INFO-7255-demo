import Plan from "@/models/Plan";
import queueService from "@/services/queue";

export const handleCreatePlan = async (planData: any) => {
  if (await Plan.findOne({ objectId: planData.objectId })) {
    throw new Error("Duplicate plan data");
  }

  const plan = await Plan.create(planData);

  await queueService.sendToQueue('CREATE', plan);

  return plan;
};

export const handleGetPlanById = async (objectId?: string) => {
  return objectId ? await Plan.findOne({ objectId }).exec() : await Plan.find({});
};

export const handleDeletePlan = async (objectId: string) => {
  const plan = await Plan.findOne({ objectId });

  if (!plan) return null;

  await Plan.findOneAndDelete({ objectId });
  await queueService.sendToQueue('DELETE', { objectId });

  return plan;
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

  const updatedPlan = await plan.save();

  await queueService.sendToQueue('UPDATE', updatedPlan);

  return updatedPlan;
};