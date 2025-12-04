import type { MemberInfo, Payload } from "@shared/types.ts";
import { Me } from "./me.ts";
import { Member } from "./member.ts";

const joinForm = document.querySelector("#join") as HTMLFormElement;
const joinButton = joinForm?.querySelector(
    "button[type=submit]",
) as HTMLButtonElement;
const userNameInput = joinForm?.querySelector("#username") as HTMLInputElement;
const avatarInput = joinForm?.querySelector("#avatar") as HTMLSelectElement;
const room = document.querySelector("#room") as HTMLElement;

const members = new Map<string, Member>();
joinButton.disabled = true;

const ws = new WebSocket(import.meta.env.VITE_WS_SERVER as string);

ws.onopen = () => {
    joinButton.disabled = false;
};

ws.onmessage = (event) => {
    let payload: Payload;

    try {
        payload = JSON.parse(event.data as string) as Payload;
        if (!payload.data || !payload.type) return;
    } catch {
        return;
    }

    if (payload.type === "created") {
        payload.data.others.forEach((member: MemberInfo) =>
            members.set(member.id, new Member(member))
        );

        const me = new Me(payload.data.me, room);

        me.onMove((payload) => {
            send({
                type: "move",
                data: { id: me.id, ...payload },
            });
        });

        me.onSpeak((message) => {
            send({
                type: "message",
                data: { id: me.id, message },
            });
        });

        members.set(payload.data.id, me);
        members.forEach((member) => room.appendChild(member.avatar));

        room.hidden = false;
        joinForm.hidden = true;
    }

    if (payload.type === "joined") {
        const member = new Member(payload.data);
        members.set(payload.data.id, member);

        room.appendChild(member.avatar);
    }

    if (payload.type === "left") {
        const member = members.get(payload.data.id);
        if (!member) return;

        members.delete(payload.data.id);
        room.removeChild(member.avatar);
    }

    if (payload.type === "move") {
        const member = members.get(payload.data.id);
        if (!member) return;

        member.move({ x: payload.data.x, y: payload.data.y });
    }

    if (payload.type === "message") {
        const speaker = members.get(payload.data.id);
        if (!speaker) return;

        speaker.speak(payload.data.message);
    }
};

ws.onerror = (event) => {
    console.error("WebSocket error observed:", event);
};

ws.onclose = (event) => {
    console.log(`WebSocket closed: Code=${event.code}, Reason=${event.reason}`);
    joinButton.disabled = true;
};
const send = (payload: Payload) => {
    if (ws.readyState !== ws.OPEN) return false;

    ws.send(JSON.stringify(payload));
    return true;
};

joinForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    if (ws.readyState !== ws.OPEN) return;

    send({
        type: "init",
        data: {
            username: userNameInput.value,
            avatar: avatarInput.value,
        },
    });
});
