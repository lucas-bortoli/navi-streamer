import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import Stream from "../stream";

export default class implements ICommand {
    public name = 'stop'
    public aliases = []
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        if (!Stream.getInstance().isStreaming()) {
            msg.channel.send('Não estou transmitindo.')
            return
        }

        await Browser.getInstance().stopStream()
        msg.react('⏹️')
    }
}