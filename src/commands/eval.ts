import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import TorrentClient from "../torrent";
import * as Utils from "../utils"
import Bot from "../bot";
import Stream from "../stream";
import Settings from "../settings";

export default class implements ICommand {
    public name = 'eval'
    public aliases = []
    public ownerOnly = true
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        // setup methods for eval function
        const torrent = TorrentClient.getInstance()
        const browser = Browser.getInstance()
        const bot = Bot.getInstance()
        const stream = Stream.getInstance()
        const settings = Settings()

        const js = args.join(' ')
        let result

        try {
            result = eval(js)

            // check if it is a promise
            if (!!result.then) result = await result
        } catch(ex) {
            result = ex
        }

        msg.channel.send(`\`\`\`js\n${String(result)}\`\`\``)
    }
}