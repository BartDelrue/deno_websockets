import type {MemberInfo} from "@shared/types.ts";

export class Member {

    avatar: HTMLElement
    id: string
    private messageBubble: HTMLElement

    constructor({username, avatar, id, pos}: MemberInfo) {

        const avatarObject = this.createAvatar({username, avatar, id, pos})

        this.avatar = avatarObject.avatar
        this.messageBubble = avatarObject.messageBubble
        this.id = id

        if (pos) this.move(pos)
    }

    private createAvatar({username, avatar, id}: { username: string, avatar: string, id: string }) {
        const div = document.createElement('div')
        const avatarSpan = document.createElement('span')
        const usernameSpan = document.createElement('span')
        const messageSpan = document.createElement('span')

        avatarSpan.innerText = avatar
        usernameSpan.innerText = username
        messageSpan.dataset.id = id

        div.appendChild(avatarSpan)
        div.appendChild(usernameSpan)
        div.appendChild(messageSpan)
        div.classList.add('member')

        return {avatar: div, messageBubble: messageSpan}
    }

    private timeout: number | null = null

    speak(message: string) {
        if (this.timeout) clearTimeout(this.timeout)
        this.messageBubble.textContent = message

        this.timeout = setTimeout(() => {
            this.messageBubble.textContent = null
        }, 5 * 1000)

    }

    move({x, y}: { x: string, y: string }) {
        this.avatar.style.left = x;
        this.avatar.style.top = y;
    }
}