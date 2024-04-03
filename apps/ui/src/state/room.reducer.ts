import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// types
import { PlayerI } from "../types";
import { useSelector } from "react-redux";

type UserMessageI = {
  userId: string;
  message: string;
};

type Target = {
  username: string | null;
  id: string;
};

// Define a type for the slice state
interface UsersState {
  gridSize: number;
  currentUserData: PlayerI | null;
  usersData: PlayerI[];
  rooms: any[];
  messages: any;
  target: Target;
  muteUsers: string[];
}

// Define the initial state using that type
const initialState: UsersState = {
  gridSize: 10,
  currentUserData: null,
  usersData: [],
  rooms: [],
  target: { username: null, id: "" },
  messages: {},
  muteUsers: [],
};

export const userSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setGridSize: (state, action: PayloadAction<number>) => {
      state.gridSize = action.payload;
    },
    setUsers: (state, action: PayloadAction<PlayerI[]>) => {
      state.usersData = action.payload;
    },
    removeUserById: (state, action: PayloadAction<string>) => {
      state.usersData = state.usersData.filter(
        (user) => user.userId !== action.payload
      );
    },
    setRooms: (state, action: PayloadAction<any>) => {
      state.rooms = action.payload;
    },
    setTarget: (state, action: PayloadAction<any>) => {
      state.target = action.payload;
    },
    addMessage: (state, action: PayloadAction<UserMessageI>) => {
      const { userId, message } = action.payload;
      state.messages[userId] = message;
    },
    userCleanMessage: (state, action) => {
      state.messages[action.payload] = "";
    },
    muteUnmuteUser: (state, action) => {
      if (state.muteUsers.includes(action.payload)) {
        state.muteUsers = state.muteUsers.filter((id) => id !== action.payload);
      } else state.muteUsers.push(action.payload);
    },
  },
});

export const {
  setGridSize,
  setUsers,
  removeUserById,
  setRooms,
  setTarget,
  muteUnmuteUser,
  addMessage,
  userCleanMessage,
} = userSlice.actions;

export const selectPlayers = (state: RootState) => state.room.usersData;
export const selectGridSize = (state: RootState) => state.room.gridSize;
export const selectUser = (state: RootState) => state.room.currentUserData;
export const selectTarget = (state: RootState) => state.room.target;
export const selectMuteUsers = (state: RootState) => state.room.muteUsers;
export const selectRooms = (state: RootState) => state.room.rooms;

export const selectUserById = (userId: string) => {
  const user = useSelector((state: RootState) =>
    state.room.usersData.find((user) => user.userId === userId)
  );

  return user;
};

export default userSlice.reducer;
