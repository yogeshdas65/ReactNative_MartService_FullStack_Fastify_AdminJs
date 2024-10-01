import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./src/models/index.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear the existing data
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Insert categories
    const categoryDocs = await Category.insertMany(categories);

    // Create a map of category names to their IDs
    const categoryMap = categoryDocs.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    }, {});

    const productWithCategoryIds = products.map((product) => ({
      ...product,
      category: categoryMap[product.category],
    }));
      
    await Product.insertMany(productWithCategoryIds)
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
}

seedDatabase();
