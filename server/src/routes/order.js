import {
    getOrderById,
    getOrders,
    updateOrderStatus,
    createOrder,
    confirmOrder
} from "../controllers/order/order.js";
import { verifyToken } from "../middleware/auth.js";

export const orderRoutes = async (fastify, options) => {
    // Pre-handler hook to check authentication for all routes
    fastify.addHook("preHandler", async (request, reply) => {
        const isAuthenticated = await verifyToken(request, reply);
        if (!isAuthenticated) {
            return reply.code(401).send({ message: "Unauthenticated" });
        }
    });

    // Define the routes
    fastify.post("/order", createOrder); // Route for creating a new order
    fastify.get("/order", getOrders); // Route for fetching orders
    fastify.patch("/order/:orderId/status", updateOrderStatus); // Route for updating order status
    fastify.post("/order/:orderId/confirm", confirmOrder); // Route for confirming an order
    fastify.get("/order/:orderId", getOrderById); // Route for fetching order by ID (Changed from post to get for proper REST)
};
