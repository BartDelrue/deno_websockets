import type {RoomDomain} from "./domain.ts";
import type {MemberInfo} from "@shared/types.ts";

export class Presenter {
    private memberEls = new Map<
        string,
        { avatar: HTMLElement; speechBubble: HTMLSpanElement }
    >();
    private userId?: string;
    private timeOutMap: Map<string, number> = new Map();
    private meCreatedCallback?: (meAvatar: HTMLElement) => void

    constructor(private domain: RoomDomain, private options: {
        roomEl: HTMLElement;
        joinForm: HTMLFormElement;
        createMemberEl: (info: MemberInfo, isMe?: boolean) => {avatar: HTMLElement, speechBubble: HTMLElement}
    }) {
        domain.events.on(
            "initialized",
            ({me, others}) => this.onInitialized(me, others),
        );
        domain.events.on(
            "memberAdded",
            ({ id, info }) => this.onMemberAdded(id, info),
        );
        domain.events.on(
            "memberRemoved",
            ({ id }) => this.onMemberRemoved(id),
        );
        domain.events.on(
            "memberMoved",
            ({ id, x, y }) => this.onMemberMoved(id, x, y),
        );
        domain.events.on(
            "message",
            ({ id, message }) => this.onMessage(id, message),
        );
    }

    onMeCreated(handler: (meAvatar: HTMLElement) => void) {
        this.meCreatedCallback = handler
    }

    private onInitialized(me: MemberInfo, others: MemberInfo[]) {
        const meEls = this.options.createMemberEl(
            me,
            true,
        );

        this.options.roomEl.appendChild(meEls.avatar);
        this.memberEls.set(me.id, meEls);
        this.userId = me.id;

        others.forEach((m) => {
            const els = this.options.createMemberEl(m, false);
            this.options.roomEl.appendChild(els.avatar);
            this.memberEls.set(m.id, els);
        });

        this.options.roomEl.hidden = false;
        this.options.joinForm.hidden = true;

        this.meCreatedCallback(meEls.avatar)
    }
    private onMemberAdded(id: string, info: MemberInfo) {
        const els = this.options.createMemberEl(info, false);
        this.options.roomEl.appendChild(els.avatar);
        this.memberEls.set(id, els);
    }
    private onMemberRemoved(id: string) {
        const entry = this.memberEls.get(id);
        if (!entry) return;

        entry.avatar.remove();
        this.memberEls.delete(id);
    }
    private onMemberMoved(id: string, x: string, y: string) {
        const entry = this.memberEls.get(id);
        if (!entry) return;

        entry.avatar.style.insetBlockStart = y;
        entry.avatar.style.insetInlineStart = x;
    }
    private onMessage(id: string, message: string) {
        const entry = this.memberEls.get(id);
        if (!entry) return;

        entry.speechBubble.textContent = message;

        const timeout = this.timeOutMap.get(id);
        if (timeout) clearTimeout(timeout);
        this.timeOutMap.set(
            id,
            setTimeout(() => entry.speechBubble.textContent = "", 5 * 1000),
        );
    }

}