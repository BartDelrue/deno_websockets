import { Room } from "./room.ts";
import type {Payload} from "@shared/types.ts";

const room = new Room();

Deno.serve((req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", () => {
    console.log("a client connected!");
  });

  socket.addEventListener("message", (event) => {
    let message: Payload;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    if (message.type === "init") {
      room.join(socket, message.data);
    }

    if (message.type === "message") {
      room.speak(message.data);
    }

    if (message.type === "move") {
      room.move(message.data);
    }
  });

  return response;
});
