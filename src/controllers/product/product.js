import Product from "../../models/product.js";

export const getProductsByCategoryId = async (req, reply) => {
  const { categoryId } = req.params; // Extract categoryId from the request parameters

  try {
    // Fetch products with the matching categoryId and exclude the 'category' field
    const products = await Product.find({ category: categoryId })
      .select("-category")
      .exec();
   
    return reply.send(products);
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
