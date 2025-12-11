import type {MemberInfo, Payload} from "@shared/types.ts";
import type {Unsubscribe} from "./transport.ts";

type DomainEvents = {
    memberAdded: { id: string; info: Pick<MemberInfo, "username" | "avatar"> };
    memberRemoved: { id: string };
    memberMoved: { id: string; x: string; y: string };
    message: { id: string; message: string };
    initialized: { me: MemberInfo; others: MemberInfo[] };
};

export class EventEmitter<Events extends Record<string, unknown>> {
    private handlers: {
        [K in keyof Events]?: Array<(payload: Events[K]) => void>;
    } = {};

    on<K extends keyof Events>(event: K, fn: (payload: Events[K]) => void) {
        (this.handlers[event] ||= []).push(fn);
        return () => this.off(event, fn);
    }

    off<K extends keyof Events>(event: K, fn: (payload: Events[K]) => void) {
        this.handlers[event] = (this.handlers[event] || []).filter((h) =>
            h !== fn
        );
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]) {
        (this.handlers[event] || []).forEach((fn) => fn(payload));
    }
}

export class RoomDomain {

    public events = new EventEmitter<DomainEvents>();
    private outboundHandlers: Array<(p: Payload) => void> = []

    onOutbound(fn: (p: Payload) => void): Unsubscribe {
        this.outboundHandlers.push(fn);
        return () => {
            this.outboundHandlers = this.outboundHandlers.filter((f) => f !== fn);
        };
    }

    private emitOutbound(p: Payload) {
        this.outboundHandlers.forEach((fn) => fn(p));
    }

    handle(payload: Payload) {
        switch (payload.type) {
            case "created":
                this.events.emit("initialized", {
                    me: payload.data.me,
                    others: payload.data.others,
                });
                break;
            case "joined":
                this.events.emit("memberAdded", {
                    id: payload.data.id,
                    info: payload.data,
                });
                break;
            case "left":
                this.events.emit("memberRemoved", {id: payload.data.id});
                break;
            case "move":
                this.events.emit("memberMoved", {
                    id: payload.data.id,
                    x: payload.data.x,
                    y: payload.data.y,
                });
                break;
            case "message":
                this.events.emit("message", {
                    id: payload.data.id,
                    message: payload.data.message,
                });
                break;
            default:
                break;
        }
    }

    init(username: string, avatar: string) {
        this.emitOutbound({type: "init", data: {username, avatar}});
    }

    move(id: string, x: string, y: string) {
        this.emitOutbound({type: "move", data: {id, x, y}});
    }

    speak(id: string, message: string) {
        this.emitOutbound({type: "message", data: {id, message}});
    }
}
