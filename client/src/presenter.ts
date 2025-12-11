import type {RoomDomain} from "./domain.ts";
import type {MemberInfo} from "@shared/types.ts";

export class Presenter {
    private memberEls = new Map<
        string,
        { avatar: HTMLElement; speechBubble: HTMLSpanElement }
    >();

    private timeOutMap: Map<string, number> = new Map();
    private meCreatedCallback?: (meAvatar: HTMLElement) => void

    constructor(private domain: RoomDomain, private options: {
        roomEl: HTMLElement;
        joinForm: HTMLFormElement;
        createMemberEl: (info: Pick<MemberInfo, 'avatar' | 'username'>, isMe?: boolean) => {avatar: HTMLElement, speechBubble: HTMLElement}
    }) {
        this.domain.events.on(
            "initialized",
            ({me, others}) => this.onInitialized(me, others),
        );
        this.domain.events.on(
            "memberAdded",
            ({ id, info }) => this.onMemberAdded(id, info),
        );
        this.domain.events.on(
            "memberRemoved",
            ({ id }) => this.onMemberRemoved(id),
        );
        this.domain.events.on(
            "memberMoved",
            ({ id, x, y }) => this.onMemberMoved(id, x, y),
        );
        this.domain.events.on(
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

        others.forEach((m) => {
            const els = this.options.createMemberEl(m, false);
            this.options.roomEl.appendChild(els.avatar);
            this.memberEls.set(m.id, els);
        });

        this.options.roomEl.hidden = false;
        this.options.joinForm.hidden = true;

        if (this.meCreatedCallback)
            this.meCreatedCallback(meEls.avatar)
    }
    private onMemberAdded(id: string, info: Pick<MemberInfo, 'avatar' | 'username'>) {
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