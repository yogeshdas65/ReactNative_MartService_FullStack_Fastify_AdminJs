import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from "jsonwebtoken";

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );

    return { accessToken, refreshToken }; // Return both tokens as an object
};


export const loginCustomer = async (req, reply) => {
    try {
        const { phone } = req.body;
        let customer = await Customer.findOne({ phone });

        if (!customer) {
            customer = new Customer({
                phone,
                role: "Customer",
                isActivated: true,
            });
            await customer.save();
        }

        const { accessToken, refreshToken } = generateTokens(customer);
        return reply.send({
            message: customer ? "Login Successful" : "Customer created and logged in",
            accessToken,
            refreshToken,
        });
    } catch (err) {
        return reply.status(500).send({ message: "Internal Server Error" });
    }
};
