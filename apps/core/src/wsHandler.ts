// types
import { PositionI, RoomData } from "./types";
export const gridSize: number = 10;

import { RoomHandler } from "./room";
import { chatbotName } from "./config";
import { getResponse } from "./common/chatbot.common";

export let roomHdl: RoomHandler = new RoomHandler();

export const handleConnections = (socket: any, io: any) => {
  console.log("A user connected");

  for (let room of roomHdl.rooms) {
    console.log(room);
  }

  socket.on(
    "userCreation",
    ({
      roomName,
      userName,
      avatarId,
    }: {
      roomName: string;
      userName: string;
      avatarId: number;
    }) => {
      console.log("emitting user creation.");

      if (roomHdl.isRoomFull(roomName)) {
        socket.emit("error_room_full");
        return;
      }

      roomHdl.createUser(socket.id, roomName, userName, avatarId, io);

      socket.join(roomName);
      io.to(roomName).emit("initMap", { gridSize });
      io.to(roomName).emit("userCreated", roomHdl.rooms.get(roomName).users);
    }
  );

  socket.on("updatePlayerDirection", (dest: PositionI) => {
    const roomId: string = (Array.from(socket.rooms)[1] as string) ?? "";
    if (!roomId.length) {
      console.error("Error invalid room at updatePlayerDirection");
      return;
    }

    const room = roomHdl.rooms.get(roomId);
    const idx = roomHdl.getUserIdx(socket.id, roomId);

    const currentDir = room.users[idx].avatarXAxis;
    const updatedXAxis = roomHdl.updateXAxis(room.users[idx].position, dest);

    if (updatedXAxis === currentDir || !updatedXAxis) return; // * no updates needed

    room.users[idx].avatarXAxis = updatedXAxis;
    roomHdl.rooms.set(roomId, room); // ! actually updates room

    io.to(roomId).emit("updateMap", {
      players: room.users,
    });
  });

  socket.on("updatePlayerPosition", (dest: PositionI) => {
    if (!dest) return;

    const roomId: string = (Array.from(socket.rooms)[1] as string) ?? "";
    if (!roomId.length) {
      console.error("Error invalid room at updatePlayerPosition");
      return;
    }

    roomHdl.updatePosition(dest, roomId, socket.id, io);
  });

  socket.on("message", async ({ message, socketId }) => {
    if (socketId === chatbotName) {
      io.to(socket.id).emit("message", {
        message,
        userId: socket.id,
      });

      const response: string = await getResponse(message);
      io.to(socket.id).emit("message", {
        message: response,
        userId: chatbotName,
      });

      return;
    }

    [socket.id, socketId].forEach((target: string) => {
      io.to(target).emit("message", { message, userId: socket.id });
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    let roomId: string = "";

    // ! en este punto roomId deja de existir, no habia de otra :p
    roomHdl.rooms.forEach((roomObj: RoomData, room: string) => {
      if (roomObj.userIdxMap.has(socket.id)) {
        roomId = room;
        return;
      }
    });

    io.emit("userDisconnected", socket.id, roomId);
    roomHdl.removeUser(socket.id, roomId);
  });
};
