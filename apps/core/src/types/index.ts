export type PositionI = {
  row: number;
  col: number;
};

export enum XAxis {
  Right = "right",
  Left = "left",
}

interface Avatar {
  [XAxis.Right]: string;
  [XAxis.Left]: string;
}

export interface Avatars {
  [key: number]: Avatar;
}

export interface UserDataI {
  userId: string;
  roomId: string;
  userName: string;
  position: PositionI;
  avatar: Avatar;
  avatarXAxis: XAxis;
}

export type userId = string;
export type usersIdx = number;
export interface RoomData {
  users: UserDataI[];
  usersPositions: Set<string>; // quick access to users positions
  userIdxMap: Map<userId, usersIdx>;
}
