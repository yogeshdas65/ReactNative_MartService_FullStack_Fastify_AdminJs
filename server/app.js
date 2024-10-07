import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  const app = Fastify();

  app.register(fastifySocketIO, {
    cors: {
      origin: "*", // Allow all origins, adjust for production as needed
    },
    pingInterval: 10000, // Ping every 10 seconds to keep the connection alive
    pingTimeout: 5000, // Timeout if no pong is received in 5 seconds
    transports: ["websocket"], // Only allow WebSocket transport
  });

  await registerRoutes(app);

  await buildAdminRouter(app);
    // 
    app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log(`Blinkit Started on ${PORT}${admin.options.rootPath}`);
  });

  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("A user connected");
      // Listen for "joinRoom" event and join the specified room (orderId)
      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`User joined room ${orderId}`);
      });
      // Listen for the "disconnect" event when a user disconnects
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  });
};

start();
