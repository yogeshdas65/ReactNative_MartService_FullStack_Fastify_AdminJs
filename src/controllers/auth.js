import jwt from "jsonwebtoken";
import { Customer, DeliveryPartner } from "../models/user.js";

const generateTokens = (user) => {
  console.log(user)
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "2d" }
  );
   console.log(accessToken, refreshToken)
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
      customer,
    });
  } catch (err) {
    return reply.status(500).send({ message: "An Error Occured", err });
  }
};

export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;
    let deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      return reply
        .status(404)
        .send({ message: "DeliveryPartner Not Found", err });
    }
    const ismatch = password === deliveryPartner.password;
    if (!ismatch) {
      return reply.status(400).send({ message: "Invalid Credential", err });
    }

    const { accessToken, refreshToken } = generateTokens(deliveryPartner);
    return reply.send({
      message: deliveryPartner ? "Login Successful" : "Customer created and logged in",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (err) {
    return reply.status(500).send({ message: "An Error Occured", err });
  }
};

export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return reply.status(401).send({ message: "Refresh token Required" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    let user;
    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.status(403).send({ message: "Invalid Role" });
    }
    if (!user) {
      return reply.status(403).send({ message: "Invalid refresh token" });
    }
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    return reply.send({
      message: "Token Refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return reply
      .status(403)
      .send({ message: "Invalid refresh token or other error", error });
  }
};

export const fetchUser = async (req, reply) => {
  const { userId, role } = req.user; 
  console.log("fetchUser", userId, role)
  try {
    console.log(req.user)
        const { userId, role } = req.user;  // Destructure userId and role from req.user
        let user;
        if (role === "Customer") {
            user = await Customer.findById(userId);
        } else if (role === "DeliveryPartner") {
            user = await DeliveryPartner.findById(userId);
        } else {
            return reply.status(403).send({ message: "Invalid Role" });
        }
        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }
        return reply.send({ message: "User fetched successfully", user });
    } catch (error) {
        return reply.status(500).send({ message: "An error occurred", error });
    }
};

