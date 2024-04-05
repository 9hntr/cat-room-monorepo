import axios from "axios";
import { Todo } from "../types";

const baseURL = import.meta.env.VITE_SERVER_URL;

const cfg = { baseURL };

export const ctx = axios.create(cfg);
ctx.defaults.headers.common[
  "Content-Security-Policy"
] = `default-src 'self' ${baseURL}`;

export const fetchRooms = async (): Promise<Todo> => {
  const { rooms } = (await ctx.get("/rooms/get")).data;
  return rooms;
};
