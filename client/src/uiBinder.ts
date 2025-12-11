import type { RoomDomain } from "./domain.ts";

type Options = {
    joinForm: HTMLFormElement;
    chatForm: HTMLFormElement;
    roomEl: HTMLElement;
};

export class UIBinder {

    private userOffset: {x: number, y: number} = { x: 0, y: 0}
    private userId?: string

    constructor(
        private domain: RoomDomain,
        private options: Options,
    ) {
        this.options.joinForm.addEventListener("submit", (e) => this.onJoin(e));
        this.options.chatForm.addEventListener("submit", (e) => this.onChat(e));

        this.domain.events.on("initialized", ({me}) => this.userId = me.id);
        this.options.roomEl.addEventListener("dragover", (e) => e.preventDefault());
        this.options.roomEl.addEventListener("drop", ({ clientX, clientY }) => this.drop(clientX, clientY));
    }

    private onJoin(e: SubmitEvent) {
        e.preventDefault();
        const formData = new FormData(this.options.joinForm);

        this.domain.init(
            formData.get("username") as string ?? "",
            formData.get("avatar") as string ?? "",
        );
    }
    private onChat(e: SubmitEvent) {
        e.preventDefault();
        if (!this.userId) return;

        const formData = new FormData(this.options.chatForm);

        this.domain.speak(this.userId, formData.get("message") as string);
        this.options.chatForm.reset();
    }

    private drop(clientX: number, clientY: number) {
        const { x, y, width, height } = this.options.roomEl.getBoundingClientRect();
        const posX = ((clientX - x - this.userOffset.x) / width) * 100 + "%";
        const posY = ((clientY - y - this.userOffset.y) / height) * 100 + "%";

        if (!this.userId) return;

        this.domain.move(this.userId, posX, posY);
    }

    initializeDrag(meAvatar: HTMLElement) {
        meAvatar.draggable = true;
        meAvatar.addEventListener("dragstart", (e) => {
            const rect = meAvatar.getBoundingClientRect();
            this.userOffset.x = e.clientX - rect.left;
            this.userOffset.y = e.clientY - rect.top;
        });
    }
}
