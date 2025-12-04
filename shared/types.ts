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
    x: number;
    y: number;
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
    username: string;
    message: string;
  };
};

export type Payload =
  | CreatedPayload
  | JoinedPayload
  | MovePayload
  | LeftPayload
  | MessagePayload;
