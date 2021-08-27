import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import Stream from "../stream";

export default class implements ICommand {
    public name = 'subtitle-offset'
    public aliases = ['suboffset', 'o']
    public ownerOnly = false

    public async exec(msg: Message, args: string[]): Promise<void> {
        const stream = Stream.getInstance()

        if (!stream.isStreaming()) {
            msg.channel.send('Não estou transmitindo nada no momento.')
            return
        }
        
        const offset = parseInt(args.shift()) || 0

        await Browser.getInstance().player_page_eval(`SetSubtitleOffset(${offset})`)
        msg.react('✅')
    }
}