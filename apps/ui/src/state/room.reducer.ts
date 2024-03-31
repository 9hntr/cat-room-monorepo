import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// types
import { PlayerI } from "../types";

type UserMessageI = {
  userId: string;
  message: string;
};

// Define a type for the slice state
interface UsersState {
  gridSize: number;
  currentUserData: PlayerI | null;
  usersData: PlayerI[];
  rooms: any[];
  messages: any;
  currentRoom: string | null;
}

// Define the initial state using that type
const initialState: UsersState = {
  gridSize: 10,
  currentUserData: null,
  usersData: [],
  rooms: [],
  currentRoom: null,
  messages: {},
};

export const userSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setGridSize: (state, action: PayloadAction<number>) => {
      state.gridSize = action.payload;
    },
    setUser: (state, action: PayloadAction<PlayerI>) => {
      state.currentUserData = action.payload;
    },
    setUsers: (state, action: PayloadAction<PlayerI[]>) => {
      state.usersData = action.payload;
    },
    removeUserById: (state, action: PayloadAction<string>) => {
      state.usersData = state.usersData.filter(
        (user) => user.userId !== action.payload
      );
    },
    setRoomList: (state, action: PayloadAction<any>) => {
      state.rooms = action.payload;
    },
    setCurrentRoom: (state, action: PayloadAction<any>) => {
      state.currentRoom = action.payload;
    },
    addMessage: (state, action: PayloadAction<UserMessageI>) => {
      const { userId, message } = action.payload;
      state.messages[userId] = message;
    },
    userCleanMessage: (state, action) => {
      state.messages[action.payload] = "";
    },
  },
});

export const {
  setGridSize,
  setUser,
  setUsers,
  removeUserById,
  setRoomList,
  setCurrentRoom,
  addMessage,
  userCleanMessage,
} = userSlice.actions;

export const selectPlayers = (state: RootState) => state.room.usersData;
export const selectGridSize = (state: RootState) => state.room.gridSize;
export const selectUser = (state: RootState) => state.room.currentUserData;

export default userSlice.reducer;
