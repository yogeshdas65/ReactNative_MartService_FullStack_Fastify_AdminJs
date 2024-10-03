import Category from "../../models/category.js";

export const getAllCategories = async (req, reply) => {
  try {
    const categories = await Category.find();
    return reply.send(categories);
  } catch (error) {
    // Handle any errors that occur
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
