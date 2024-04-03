export { findPath } from "./pathfinding.common";
export { getResponse } from "./chatbot.common";

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const getRandomSecondBetween = (s: number): number => {
  return Math.floor(Math.random() * s) + 1;
};
