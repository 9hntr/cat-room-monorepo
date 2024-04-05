import { RoomData, XAxis, PositionI } from "./types";
import { chatbotName } from "./config";
import cron from "node-cron";
import { getRandomSecondBetween, findPath } from "./lib";

import { avatars } from "./data";
import { Server } from "socket.io";

const tasks = new Map<string, any>();
export const speedUserMov: number = 220;

const gridSize: number = 10;
const roomLimit: number = 10;

export class RoomHandler {
  rooms: Map<string, RoomData>;

  constructor() {
    this.rooms = new Map();

    // this.rooms.set("keep the block hot", {
    //   users: [],
    //   usersPositions: new Set<string>(),
    //   userIdxMap: new Map<string, number>(),
    // });
  }

  isRoomFull(roomId: string): boolean {
    const roomData = this.rooms.get(roomId);

    if (!roomData) return false;
    if (roomData.users.length >= roomLimit) return true;
  }

  getUserIdx(userId: string, roomId): number {
    return this.rooms.get(roomId)?.userIdxMap.get(userId);
  }

  // Update avatar based on left/right destination
  updateXAxis = (from: PositionI, to: PositionI): XAxis | null => {
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

  getRandomPosition(room: RoomData): number[] {
    let position: number[] = [];

    for (;;) {
      position = [
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize),
      ];

      if (!room.usersPositions.has(String(position))) break;
    }

    return position;
  }

  createUser(
    userId: string,
    roomId: string,
    userName: string,
    avatarId: number,
    io: Server
  ): void {
    const roomData = this.rooms.get(roomId);
    let newPosition = [0, 0]; // initial position if no players in the room

    let newUser = {
      userName,
      userId,
      roomId,
      position: { row: newPosition[0], col: newPosition[1] },
      avatar: avatars[avatarId],
      avatarXAxis: XAxis.Right,
    };

    if (!roomData) {
      const newRoomData: RoomData = {
        users: [],
        usersPositions: new Set<string>(),
        userIdxMap: new Map<string, number>(),
      };

      newRoomData.users.push(newUser);
      newRoomData.userIdxMap.set(userId, 0);
      newRoomData.usersPositions.add(String(newPosition));

      // create chatbot on room init
      let chatbotPosition = this.getRandomPosition(newRoomData);

      const chatBot = {
        userName: chatbotName,
        userId: chatbotName,
        roomId,
        position: { row: chatbotPosition[0], col: chatbotPosition[1] },
        avatar: avatars[1], // todo: create unique avatar
        avatarXAxis: XAxis.Right,
      };

      newRoomData.users.push(chatBot);
      newRoomData.userIdxMap.set(chatbotName, 1);
      newRoomData.usersPositions.add(String(chatbotPosition));

      this.rooms.set(roomId, newRoomData);

      const newTask = cron.schedule(
        `*/${getRandomSecondBetween(20, 10)} * * * * *`,
        () => {
          // ? esto puede dar problemas con los puestos ocupados
          const pos = this.getRandomPosition(this.rooms.get(roomId));

          this.updatePosition(
            { row: pos[0], col: pos[1] },
            roomId,
            chatbotName,
            io
          );
        }
      );

      tasks.set(roomId, newTask);

      return;
    }

    newPosition = this.getRandomPosition(roomData);
    newUser = {
      ...newUser,
      position: { row: newPosition[0], col: newPosition[1] },
    };

    roomData.users.push(newUser);
    roomData.userIdxMap.set(userId, roomData.users.length - 1);
    roomData.usersPositions.add(String(newPosition));

    this.rooms.set(roomId, roomData);
  }

  updatePosition(
    dest: PositionI,
    roomId: string,
    socketId: string,
    io: Server
  ): void {
    const room = this.rooms.get(roomId);
    const idx = this.getUserIdx(socketId, roomId);
    const { row: currentRow, col: currentCol } = room.users[idx].position;

    // Remove current position from usersPositions
    room.usersPositions.delete(String([currentRow, currentCol]));
    this.rooms.set(roomId, room);

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

    const updatedXAxis = this.updateXAxis(
      { row: currentRow, col: currentCol },
      dest
    );

    if (updatedXAxis) {
      const currentDir = room.users[idx].avatarXAxis;
      if (updatedXAxis !== currentDir)
        room.users[idx].avatarXAxis = updatedXAxis;

      this.rooms.set(roomId, room); // ! actually updates room
    }

    let currentStep = 0;
    const interval = setInterval(() => {
      const newPosition = path[currentStep];
      const lastPosition = room.users[idx].position;

      room.users[idx].position = newPosition;
      room.usersPositions.delete(String([lastPosition.row, lastPosition.col]));
      this.rooms.set(roomId, room); // ! actually updates room
      currentStep++;

      io.to(roomId).emit("updateMap", {
        players: room.users,
      });

      if (currentStep === path.length) {
        clearInterval(interval);
        return;
      }
    }, speedUserMov);

    room.usersPositions.add(String([dest.row, dest.col]));
    this.rooms.set(roomId, room); // ! actually updates room
  }

  removeUser(userId: string, roomId: string): void {
    const roomData: RoomData = this.rooms.get(roomId);
    if (!roomData) return;

    const idx: number = roomData.userIdxMap.get(userId);
    if (typeof idx === "undefined") return;

    // Delete room and stop task once the last user is gone
    const roomOnlineUsers: number = roomData.users?.length;

    // User just disconnected + isa
    if (roomOnlineUsers === 2) {
      this.rooms.delete(roomId);

      tasks.get(roomId)?.stop(); // ! void func, make sure its actually stopped
      tasks.delete(roomId);

      return;
    }

    // Remove the position from the list before updating users
    const { row: deleteRow, col: deleteCol } = roomData.users[idx].position;
    roomData.usersPositions.delete(String([deleteRow, deleteCol]));

    // To keep it O(1) we move the last user from the array to another position and pop from the list
    const lastUser = roomData.users[roomData.users.length - 1];
    roomData.users[idx] = lastUser;
    roomData.users.pop();

    // Update users indexes
    roomData.userIdxMap.set(lastUser?.userId, idx);
    roomData.userIdxMap.delete(userId);

    this.rooms.set(roomId, roomData);
  }
}
