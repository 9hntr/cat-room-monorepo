import { RoomData, XAxis, Avatars } from "./types";

export const speedUserMov: number = 220;
export const avatars: Avatars = {
  1: {
    [XAxis.Right]: "1_r.png",
    [XAxis.Left]: "1_l.png",
  },
  2: {
    [XAxis.Right]: "2_r.png",
    [XAxis.Left]: "2_l.png",
  },
  3: {
    [XAxis.Right]: "3_r.png",
    [XAxis.Left]: "3_l.png",
  },
  4: {
    [XAxis.Right]: "4_r.png",
    [XAxis.Left]: "4_l.png",
  },
  5: {
    [XAxis.Right]: "5_r.png",
    [XAxis.Left]: "5_l.png",
  },
};

const gridSize: number = 10;
const roomLimit: number = 10;

export class RoomHandler {
  rooms: Map<string, RoomData>;

  constructor() {
    this.rooms = new Map();

    this.rooms.set("keep the block hot", {
      users: [],
      usersPositions: new Set<string>(),
      userIdxMap: new Map<string, number>(),
    });
  }

  isRoomFull(roomId: string): boolean {
    const roomData = this.rooms.get(roomId);

    if (!roomData) return false;
    if (roomData.users.length >= roomLimit) return true;
  }

  getUserIdx(userId: string, roomId): number {
    return this.rooms.get(roomId)?.userIdxMap.get(userId);
  }

  createUser(
    userId: string,
    roomId: string,
    userName: string,
    avatarId: number
  ) {
    const roomData = this.rooms.get(roomId);
    let newPosition = [0, 0]; // * initial position if no players in the room

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

      this.rooms.set(roomId, newRoomData);
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

  removeUser(userId: string, roomId: string) {
    const roomData: RoomData = this.rooms.get(roomId);
    if (!roomData) return;

    const idx: number = roomData.userIdxMap.get(userId);
    if (typeof idx === "undefined") return;

    // Delete room once the last user is gone
    const roomOnlineUsers: number = roomData.users?.length - 1;
    if (roomOnlineUsers === 0) {
      this.rooms.delete(roomId);
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
