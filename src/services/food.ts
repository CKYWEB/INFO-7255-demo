import Food from "@/models/Food"

export const handleCreateFood = async (name: string) => {
  return await Food.create({ name });
};

export const handleGetAllFoods = async () => {
  return Food.find();
};

export const handleGetFoodById = async (id: string) => {
  return Food.findById(id);
};

export const handleDeleteFood = async (id: string) => {
  return Food.findByIdAndDelete(id);
};