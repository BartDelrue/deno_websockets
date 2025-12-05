import type { Payload } from "@shared/types.ts";

export interface Transport {
    send(payload: Payload): boolean;
    onMessage(handler: (payload: Payload) => void): void;
}

export type Unsubscribe = () => void;

export class WebSocketTransport implements Transport {
    private ws: WebSocket | null = null;
    private handlers: Array<(p: Payload) => void> = [];

    constructor(private url: string) {
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onmessage = (ev) => {
            try {
                const payload = JSON.parse(ev.data as string) as Payload;
                // todo: zod
                this.handlers.forEach((h) => h(payload));
            } catch { /* empty */ }
        };
        this.ws.onopen = () => console.info("WebSocket open");
        this.ws.onerror = (ev) => {
            console.error(`WebSocket error`, ev);
        };
        this.ws.onclose = (ev) => {
            console.info(
                `WebsSocket closed: Code:${ev.code}, Reason=${ev.reason}`,
            );
        };
    }

    send(payload: Payload):boolean {
        if (this.ws?.readyState !== WebSocket.OPEN) return false;
        this.ws.send(JSON.stringify(payload));
        return true;
    };

    onMessage(handler: (payload: Payload) => void): Unsubscribe {
        this.handlers.push(handler)
        return () => this.handlers.filter(h => h !== handler)
    }
}
