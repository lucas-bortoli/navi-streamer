import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";

export default class implements ICommand {
    public name = 'stop'
    public aliases = []
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        await Browser.getInstance().stopStream()
        msg.channel.send(`*Parando stream*`)
    }
}