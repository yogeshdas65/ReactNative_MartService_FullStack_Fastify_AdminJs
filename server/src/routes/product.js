import { getAllCategories } from "../controllers/product/category.js";
import { getProductsByCategoryId } from "../controllers/product/product.js";

// Category routes
export const categoryRoutes = async (fastify, options) => {
  fastify.get("/categories", getAllCategories);  // Fixed the typo in the endpoint
};

// Product routes
export const productRoutes = async (fastify, options) => {
  fastify.get("/products/:categoryId", getProductsByCategoryId);
};
