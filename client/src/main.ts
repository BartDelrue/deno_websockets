import type { MemberInfo, Payload } from "@shared/types.ts";
import { RoomDomain } from "./domain.ts";
import { UIBinder } from "./uiBinder.ts";
import { WebSocketTransport } from "./transport.ts";
import {Presenter} from "./presenter.ts";

const joinForm = document.querySelector("#join");
if (!joinForm) throw new Error("missing #join form");

const chatForm = document.querySelector("#chatbox");
if (!chatForm) throw new Error("missing #chatbox form");

const roomEl = document.querySelector("#room") as HTMLElement;
if (!roomEl) throw new Error("missing #room");

const transport = new WebSocketTransport(
    import.meta.env.VITE_WS_SERVER as string,
);
const domain = new RoomDomain();
const presenter = new Presenter(domain, {
    joinForm,
    roomEl,
    chatForm,
    createMemberEl({ username, avatar }: MemberInfo, isMe?: boolean) {
        const div = document.createElement("div");
        const avatarSpan = document.createElement("span");
        const usernameSpan = document.createElement("span");
        const messageSpan = document.createElement("span");

        avatarSpan.innerText = avatar;
        usernameSpan.innerText = username;

        div.appendChild(avatarSpan);
        div.appendChild(usernameSpan);
        div.appendChild(messageSpan);
        div.classList.add("member");

        if (isMe) div.classList.add("me");

        return { avatar: div, speechBubble: messageSpan };
    },
})

const uiBinder = new UIBinder(
    domain,
    {
        joinForm,
        roomEl,
        chatForm,
    },
);

presenter.onMeCreated((avatar: HTMLElement) => uiBinder.initializeDrag(avatar))
transport.onMessage((payload) => domain.handle(payload));
domain.onOutbound((payload: Payload) => transport.send(payload));