import io from "socket.io-client";

import { useDispatch } from "react-redux";

// types
import { MessageT } from "../types";

import {
  setGridSize,
  setUsers,
  removeUserById,
  addMessage,
} from "../state/room.reducer";
import { useEffect } from "react";

export const socket = io(import.meta.env.VITE_SERVER_URL, {
  transports: ["websocket"],
});

export const createUser = (data: {
  roomName: string;
  userName: string;
  avatarId: number;
}) => {
  socket.emit("userCreation", data);
};

export const sendMessageTo = (message: string, socketId: string) => {
  socket.emit("message", { message, socketId });
};

export const updatePlayerPosition = (data: { row: number; col: number }) =>
  socket.emit("updatePlayerPosition", data);

const SocketHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("initMap", (data) => {
      dispatch(setGridSize(data.gridSize));
    });

    socket.on("error_room_full", () => {
      console.error("error_room_full");
    });

    socket.on("userDisconnected", (userId) => {
      dispatch(removeUserById(userId));
    });

    socket.on("updateMap", (data) => {
      dispatch(setUsers(data?.players)); // ! si no metemos la lista completa de users no funciona wtf
    });

    socket.on("userCreated", (users) => {
      dispatch(setUsers(users)); // ! todo: busca como arreglar luego wtf 2
    });

    socket.on("message", ({ message, userId }: MessageT) => {
      dispatch(
        addMessage({
          userId,
          message,
        })
      );
    });

    return () => {
      socket.disconnect(); // * disconnect the socket connection
      socket.off("userCreated"); // * unsubscribe from the "userCreated" event
    };
  }, [socket, dispatch]);

  return null;
};

export default SocketHandler;
