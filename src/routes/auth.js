import { fetchUser, loginCustomer, loginDeliveryPartner, refreshToken } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";

export const authRoutes = async (fastify, options) => {
    fastify.post("/customer/login", loginCustomer);
    fastify.post("/delivery/login", loginDeliveryPartner);
    fastify.post("/refresh-token", refreshToken);
    fastify.post("/user", { 
        preHandler: [verifyToken], 
        handler: fetchUser // Corrected handler reference
    });
};
