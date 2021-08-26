import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";

export default class implements ICommand {
    public name = 'subtitle-offset'
    public aliases = ['suboffset']
    public ownerOnly = false

    public async exec(msg: Message, args: string[]): Promise<void> {
        const offset = parseInt(args.shift()) || 0

        await Browser.getInstance().player_page_eval(`SetSubtitleOffset(${offset})`)
        msg.react('✅')
    }
}