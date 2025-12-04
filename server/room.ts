import type { MemberInfo, Payload } from "@shared/types.ts";
import type { Member } from "./types.ts";

export class Room {
  private members = new Map<
    string,
    Member
  >();

  private handlers = new Map<
    string,
    {
      close: EventListenerOrEventListenerObject;
      error: EventListenerOrEventListenerObject;
    }
  >();

  join(socket, { username, avatar }: Pick<MemberInfo, "username" | "avatar">) {
    const id = crypto.randomUUID();
    const me = { id, username, avatar };
    const others = Array.from(this.members.values()).map((
      { id, username, avatar, pos },
    ) => ({
      id,
      username,
      avatar,
      pos,
    }));
    this.members.set(id, { ...me, socket });

    socket.addEventListener("close", () => this.leave(id));
    socket.addEventListener("error", () => this.leave(id));

    this.send(socket, {
      type: "created",
      data: { id, me, others },
    });
    this.broadcast({
      type: "joined",
      data: {
        id,
        username,
        avatar,
      },
    }, { exclude: [id] });
  }

  speak({ id, message }) {
    const user = this.members.get(id);
    if (!user) return;

    this.broadcast({
      type: "message",
      data: {
        username: user.username,
        id: user.id,
        message,
      },
    });
  }

  move(data) {
    const user = this.members.get(data.id);
    if (!user) return;

    user.pos = { x: data.x, y: data.y };
    this.broadcast({ type: "move", data });
  }

  leave(id: string) {
    const user = this.members.get(id);
    if (!user) return;

    const data = { ...user };
    this.members.delete(id);

    this.broadcast({ type: "left", data });

    if (user.socket.readyState === WebSocket.OPEN) {
      user.socket.close();
    }
  }

  send(socket: WebSocket, payload: Payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
  }

  broadcast(payload: Payload, options?: { exclude: string[] }) {
    this.members.forEach((m) => {
      if (options?.exclude?.includes(m.id)) return;
      this.send(m.socket, payload);
    });
  }
}
