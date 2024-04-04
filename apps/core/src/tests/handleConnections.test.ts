import { handleConnections, gridSize } from "../wsHandler";
import { speedUserMov } from "../room";

import { XAxis } from "../types";
import { sleep } from "../common";
import { avatars } from "../data";

const socketMock = {
  id: "socketId",
  on: jest.fn(),
  emit: jest.fn(),
  join: jest.fn(),
  rooms: new Set(),
};

const ioMock = {
  to: jest.fn(() => ioMock),
  emit: jest.fn(),
};

const user = {
  roomName: "room1",
  userName: "user1",
  avatarId: 1,
};

handleConnections(socketMock, ioMock);
const eventHandlers = socketMock.on.mock.calls;
// ! si se añaden event handlers o se modifica su orden revisar aqui :
/*  eventHandlers = [
      [ 'userCreation', [Function (anonymous)] ],
      [ 'updatePlayerPosition', [Function (anonymous)] ],
      [ 'message', [Function (anonymous)] ],
      [ 'getRoomList', [Function (anonymous)] ],
      [ 'disconnect', [Function (anonymous)] ]
    ]
*/

test("Testing userCreation event", () => {
  const expectedUserCreated = {
    userId: socketMock.id,
    roomId: user.roomName,
    userName: user.userName,
    position: { row: expect.any(Number), col: expect.any(Number) },
    avatar: avatars[user.avatarId],
    avatarXAxis: XAxis.Right,
  };

  const userCreationEvent = eventHandlers[0][1];
  userCreationEvent(user);

  expect(ioMock.to).toHaveBeenCalledWith(user.roomName);
  expect(ioMock.emit).toHaveBeenCalledWith("initMap", { gridSize });
  expect(ioMock.emit).toHaveBeenCalledWith("userCreated", [
    expectedUserCreated,
  ]);
});

test("Testing updatePlayerPosition event", async () => {
  const destination = { row: 0, col: 3 }; // 3 steps

  socketMock.rooms.add("broadcast?");
  socketMock.rooms.add(user.roomName);

  const updatePlayerPositionEvent = eventHandlers[1][1];
  updatePlayerPositionEvent(destination);

  await sleep(speedUserMov * 3 + 50); // wait for the 3 steps + 50ms

  expect(ioMock.to).toHaveBeenCalledWith(user.roomName);

  // ! ioMock.to.mock.calls might change use console.log
  expect(ioMock.to.mock.calls.slice(2).length).toBe(3);
});

// test("Testing message event", () => {
//   const message: string = "hello world";
//   const messageEvent = eventHandlers[2][1];
//   messageEvent({ message, socketId: "roomId" });

//   expect(ioMock.emit).toHaveBeenCalledWith("message", {
//     message,
//     userId: expect.any(String),
//   });
// });

test("Testing disconnect event", () => {
  const userDisconnectedEvent = eventHandlers[3][1];
  userDisconnectedEvent();

  expect(ioMock.emit).toHaveBeenCalledWith(
    "userDisconnected",
    socketMock.id,
    user.roomName
  );
});
