import { findPath } from "./common";

// types
import { PositionI, RoomData, XAxis } from "./types";
export const gridSize: number = 10;

import { RoomHandler, speedUserMov } from "./room";

export const roomHdl = new RoomHandler();

// * Update avatar based on left/right destination
const updateXAxis = (from: PositionI, to: PositionI): XAxis | null => {
  let updatedXAxis: XAxis | null = null;

  const deltaRow = to.row - from.row;
  const deltaCol = to.col - from.col;

  // Compare column values
  if (deltaCol > 0) updatedXAxis = XAxis.Right;
  else if (deltaCol < 0) updatedXAxis = XAxis.Left;

  // Diagonal movement
  if (Math.abs(deltaRow) === Math.abs(deltaCol)) {
    if (deltaCol > 0 && deltaRow < 0) updatedXAxis = XAxis.Right;
    else if (deltaCol < 0 && deltaRow > 0) updatedXAxis = XAxis.Left;
  }

  return updatedXAxis;
};

export const handleConnections = (socket: any, io: any) => {
  console.log("A user connected");

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

      roomHdl.createUser(socket.id, roomName, userName, avatarId);

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
    const updatedXAxis = updateXAxis(room.users[idx].position, dest);

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

    const room = roomHdl.rooms.get(roomId);
    const idx = roomHdl.getUserIdx(socket.id, roomId);
    const { row: currentRow, col: currentCol } = room.users[idx].position;

    // Remove current position from usersPositions
    room.usersPositions.delete(String([currentRow, currentCol]));
    roomHdl.rooms.set(roomId, room);

    const invalidPositions = Array.from(room.usersPositions, (pos: string) =>
      pos.split(",").map(Number)
    );

    const path = findPath(
      currentRow,
      currentCol,
      dest.row,
      dest.col,
      gridSize,
      invalidPositions
    );

    if (!path.length) return;

    const updatedXAxis = updateXAxis(
      { row: currentRow, col: currentCol },
      dest
    );

    if (updatedXAxis) {
      const currentDir = room.users[idx].avatarXAxis;
      if (updatedXAxis !== currentDir)
        room.users[idx].avatarXAxis = updatedXAxis;

      roomHdl.rooms.set(roomId, room); // ! actually updates room
    }

    let currentStep = 0;
    const interval = setInterval(() => {
      const newPosition = path[currentStep];
      const lastPosition = room.users[idx].position;

      room.users[idx].position = newPosition;
      room.usersPositions.delete(String([lastPosition.row, lastPosition.col]));
      roomHdl.rooms.set(roomId, room); // ! actually updates room
      currentStep++;

      io.to(roomId).emit("updateMap", {
        players: room.users,
      });

      if (currentStep === path.length) {
        clearInterval(interval);
        return;
      }
    }, speedUserMov); // * interval: the greater the slower the movements will be

    room.usersPositions.add(String([dest.row, dest.col]));
    roomHdl.rooms.set(roomId, room); // ! actually updates room
  });

  socket.on("message", ({ message, socketId }) => {
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
