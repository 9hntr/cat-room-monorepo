export { findPath } from "./pathfinding.lib";
export { getResponse } from "./chatbot.lib";

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const getRandomSecondBetween = (s: number, y: number): number => {
  return Math.floor(Math.random() * s) + y;
};
