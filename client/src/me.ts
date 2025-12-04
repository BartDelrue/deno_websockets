import type {MemberInfo} from "@shared/types.ts";
import {Member} from "./member.ts";
export class Me extends Member {

    private moveCallback: ((options?: { x: string; y: string }) => void) | undefined
    private speakCallback: ((message: string) => void) | undefined

    constructor(data: MemberInfo, room: HTMLElement) {
        super(data);

        const userOffset = {x: 0, y: 0}

        this.avatar.classList.add('me')
        this.avatar.draggable = true
        this.avatar.addEventListener('dragstart', function (e) {
            const rect = this.getBoundingClientRect();
            userOffset.x = e.clientX - rect.left;
            userOffset.y = e.clientY - rect.top;
        })

        room.addEventListener('dragover', e => {
            e.preventDefault()
        })
        room.addEventListener('drop', ({clientX, clientY}) => {
            const {x, y, width, height} = room.getBoundingClientRect()
            const posX = ((clientX - x - userOffset.x) / width) * 100 + "%"
            const posY = ((clientY - y - userOffset.y) / height) * 100 + "%"
            if (this.moveCallback) this.moveCallback({x: posX, y: posY})
        })

        const chatbox: HTMLFormElement | undefined = room.querySelector('.chatbox')
        if (!chatbox) return

        chatbox.addEventListener("submit", (e) => {
            e.preventDefault()

            const data = new FormData(chatbox)
            const message = data.get('message') as string
            if (this.speakCallback && message) this.speakCallback(message)
            chatbox.reset()
        })
    }


    onSpeak(callback: (payload: string) => void) {
        this.speakCallback = callback
    }

    onMove(callback: (payload?: { x: string, y: string }) => void) {
        this.moveCallback = callback
    }
}