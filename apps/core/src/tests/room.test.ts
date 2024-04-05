import { RoomHandler } from "../room";
import { RoomData, XAxis } from "../types";

import { avatars } from "../data";

const mockRooms = new RoomHandler();

const user = {
  userName: "user",
  userId: "socketId",
  roomId: "room",
  avatar: avatars[1],
};

let room: RoomData | undefined;

// test("Testing create user", () => {
//   mockRooms.createUser(user.userId, user.roomId, user.userName, 1);
//   room = mockRooms.rooms.get(user.roomId);

//   expect(room.users[0]).toEqual({
//     userName: user.userName,
//     userId: user.userId,
//     roomId: user.roomId,
//     position: { col: expect.any(Number), row: expect.any(Number) },
//     avatar: user.avatar,
//     avatarXAxis: XAxis.Right,
//   });
//   expect(room.userIdxMap.get(user.userId)).toBe(0);
//   expect(room.usersPositions.has("0,0")).toBeTruthy();
// });

// test("Testing remove last user", () => {
//   mockRooms.removeUser(user.userId, user.roomId);

//   expect(mockRooms.rooms.has(user.roomId)).toBeFalsy();
// });

// test("Testing filling a room", () => {});
