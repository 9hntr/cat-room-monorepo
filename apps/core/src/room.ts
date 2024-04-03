import { RoomData, XAxis, PositionI } from "./types";
import { chatbotName } from "./config";
import cron from "node-cron";
import { getRandomSecondBetween, findPath } from "./common";

import { avatars } from "./data";

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

  setRandomPosition = (roomId: string): void => {
    const room = this.rooms.get(roomId);
    const userIdx = room.userIdxMap.get(chatbotName);

    // Remove current position from usersPositions
    room.usersPositions.delete(
      String([
        room.users[userIdx].position.row,
        room.users[userIdx].position.col,
      ])
    );
    this.rooms.set(roomId, room);

    let newPosition: number[] = [];

    for (;;) {
      newPosition = [
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize),
      ];

      if (!room.usersPositions.has(String(newPosition))) break;
    }

    const updatedXAxis = this.updateXAxis(room.users[userIdx].position, {
      row: newPosition[0],
      col: newPosition[1],
    });

    if (updatedXAxis && updatedXAxis !== room.users[userIdx].avatarXAxis) {
      room.users[userIdx].avatarXAxis = updatedXAxis;
    }

    room.users[userIdx].position = { row: newPosition[0], col: newPosition[1] };
    room.usersPositions.add(String(newPosition));
    this.rooms.set(roomId, room);

    return;
  };

  createUser(
    userId: string,
    roomId: string,
    userName: string,
    avatarId: number
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
      let chatbotPosition = [];
      for (;;) {
        chatbotPosition = [
          Math.floor(Math.random() * gridSize),
          Math.floor(Math.random() * gridSize),
        ];

        if (String(chatbotPosition) !== String(newPosition)) break;
      }

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

      // ! create cron job for isabella movement
      const newTask = cron.schedule(
        `*/${getRandomSecondBetween(10)} * * * * *`,
        () => this.setRandomPosition(roomId)
      );

      tasks.set(roomId, newTask);
    } else {
      let newPosition = [];

      for (;;) {
        newPosition = [
          Math.floor(Math.random() * gridSize),
          Math.floor(Math.random() * gridSize),
        ];

        let foundPosition = roomData
          ? roomData.usersPositions.has(String(newPosition))
          : false;
        if (!foundPosition) break;
      }

      newUser = {
        ...newUser,
        position: { row: newPosition[0], col: newPosition[1] },
      };

      roomData.users.push(newUser);
      roomData.userIdxMap.set(userId, roomData.users.length - 1);
      roomData.usersPositions.add(String(newPosition));

      this.rooms.set(roomId, roomData);
    }
  }

  updatePosition(dest: PositionI, socket: any, io: any): void {
    const roomId: string = (Array.from(socket.rooms)[1] as string) ?? "";
    if (!roomId.length) {
      console.error("Error invalid room at updatePlayerPosition");
      return;
    }

    const room = this.rooms.get(roomId);
    const idx = this.getUserIdx(socket.id, roomId);
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
    const roomOnlineUsers: number = roomData.users?.length - 1;
    if (roomOnlineUsers === 0) {
      this.rooms.delete(roomId);
      tasks[roomId].stop();
      delete tasks[roomId];

      console.log("tasks", tasks);

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
