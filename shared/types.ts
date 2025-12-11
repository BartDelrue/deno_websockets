export interface Pos {
  x: string;
  y: string;
}

export interface MemberInfo {
  id: string;
  username: string;
  avatar: string;
  pos?: Pos;
}

/* Payload variants */

export type InitPayload = {
    type: "init";
    data: Pick<MemberInfo, "username" | "avatar">;
};

export type CreatedPayload = {
  type: "created";
  data: {
    id: string;
    me: MemberInfo;
    others: MemberInfo[];
  };
};

export type JoinedPayload = {
  type: "joined";
  data: {
    id: string;
    username: string;
    avatar: string;
    pos?: Pos;
  };
};

export type MovePayload = {
  type: "move";
  data: {
    id: string;
    x: string;
    y: string;
  };
};

export type LeftPayload = {
  type: "left";
  data: MemberInfo;
};

export type MessagePayload = {
  type: "message";
  data: {
    id: string;
    message: string;
  };
};

export type Payload =
  | InitPayload
  | CreatedPayload
  | JoinedPayload
  | MovePayload
  | LeftPayload
  | MessagePayload;
