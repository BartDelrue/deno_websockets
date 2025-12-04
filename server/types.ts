import type { MemberInfo } from "@shared/types.ts";

export interface Member extends MemberInfo {
  socket: WebSocket;
}
