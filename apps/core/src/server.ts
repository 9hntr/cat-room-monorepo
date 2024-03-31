import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import "dotenv/config";

// multi threading
const { availableParallelism } = require("node:os");
const cluster = require("node:cluster");
const { setupPrimary } = require("@socket.io/cluster-adapter");

// ws
import { handleConnections } from "./wsHandler";

const PORT = 3000;

if (cluster.isPrimary) {
  let numCPUs = 1; // availableParallelism();
  numCPUs = numCPUs > 1 ? numCPUs / 2 : 1;

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

    const pubClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    const io = new Server(server, {
      cors: { origin: process.env.UI_URL, methods: ["GET", "POST"] },
      adapter: createAdapter(pubClient, subClient), // * set up an adapter on each worker thread
    });

    app.use(cors());

    io.on("connection", (socket) => handleConnections(socket, io));

    server.listen(PORT, () => {
      console.log(`server running at http://localhost:${PORT}`);
    });
  })();
}
