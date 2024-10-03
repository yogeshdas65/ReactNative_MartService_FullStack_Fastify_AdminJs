import Order from "../../models/order.js";
import Branch from "../../models/branch.js";
import { Customer } from "../../models/user.js";
import Order from "../../models/order.js";
import { DeliveryPartner } from "../../models/user.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user; // Extract userId from the request
    const { items, branch, totalPrice } = req.body; // Extract items, branch, and totalPrice from the request body
    // Find the customer by userId
    const customerData = await Customer.findById(userId);
    if (!customerData) {
      return reply.status(404).send({ message: "Customer not found" });
    }
    // Find the branch data by branch ID
    const branchData = await Branch.findById(branch);
    if (!branchData) {
      return reply.status(404).send({ message: "Branch not found" });
    }
    // Create a new order
    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      branch,
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "No address available",
      },
      pickupLocation: {
        latitude: branchData.liveLocation.latitude,
        longitude: branchData.liveLocation.longitude,
        address: branchData.address || "No address available",
      },
    });
    // Save the new order to the database
    const savedOrder = await newOrder.save();
    // Send the saved order as a response
    return reply.status(201).send(savedOrder);
  } catch (error) {
    // Handle any errors
    return reply.status(500).send({ message: "Failed to create order", error });
  }
};

export const confirmOrder = async (req, reply) => {
  try {
    const { orderId } = req.params; // Extract orderId from request parameters
    const { userId } = req.user; // Extract userId from the request user
    const { deliveryPersonLocation } = req.body; // Extract deliveryPersonLocation from the request body
    // Find the delivery person by userId
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery Person not found" });
    }
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }
    // Check if the order is available for confirmation
    if (order.status !== "available") {
      return reply.status(400).send({ message: "Order is not available" });
    }
    // Update order details
    order.status = "confirmed";
    order.deliveryPartner = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPersonLocation?.latitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation?.address || "No address available",
    };
    await order.save();
    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to confirm order", error });
  }
};

export const updateOrderStatus = async (req, reply) => {
  try {
    const { orderId } = req.params; // Extract orderId from request parameters
    const { status, deliveryPersonLocation } = req.body; // Extract status and deliveryPersonLocation from the request body
    const { userId } = req.user; // Extract userId from the request user
    // Find the delivery person by userId
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery Person not found" });
    }
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }
    // Check if the order status is "cancelled" or "delivered"
    if (["cancelled", "delivered"].includes(order.status)) {
      return reply.status(400).send({ message: "Order cannot be updated" });
    }
    // Ensure the delivery person is authorized to update the order
    if (order.deliveryPartner.toString() !== userId) {
      return reply.status(403).send({ message: "Unauthorized" });
    }
    order.status = status;
    order.deliveryPersonLocation = deliveryPersonLocation;
    await order.save();
    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to update order status", error });
  }
};
