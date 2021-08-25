import { Message, Client } from "discord.js"

export default interface ICommand {
    exec: (msg: Message, args: string[]) => Promise<void>,
    name: string,
    ownerOnly: boolean
}