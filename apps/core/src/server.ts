import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import "dotenv/config";

// multi threading
const { availableParallelism } = require("node:os");
const cluster = require("node:cluster");
const { setupPrimary } = require("@socket.io/cluster-adapter");

// ws
import { handleConnections } from "./wsHandler";

import roomRoutes from "./routes/room.routes";

const PORT = 3000;
const wsMaxDisconnectionDurationSecs = 10;

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
};

if (cluster.isPrimary) {
  let numCPUs =
    process.env.NODE_ENV === "development" ? 1 : availableParallelism();

  // create one worker per available core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      PORT: PORT + i,
    });
  }

  setupPrimary();
} else {
  (async () => {
    const app = express();
    const server = http.createServer(app);

    const redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
    });

    await redisClient.connect();

    const io = new Server(server, {
      connectionStateRecovery: {
        maxDisconnectionDuration: wsMaxDisconnectionDurationSecs * 1000,
      },
      cors: corsOptions,
      adapter: createAdapter(redisClient),
    });

    app.use(cors(corsOptions));
    app.use("/rooms", roomRoutes);

    io.on("connection", (socket) => handleConnections(socket, io));

    server.listen(PORT, () => {
      console.log(`server running at http://localhost:${PORT}`);
    });
  })();
}
