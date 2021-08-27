import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import Stream from "../stream";

export default class implements ICommand {
    public name = 'seek'
    public aliases = [ 's' ]
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        if (!Stream.getInstance().isStreaming()) {
            msg.channel.send('Não estou transmitindo.')
            return
        }
        
        const fullArgs = args.join(' ')
        let total = 0

        for (let i = 0; i < fullArgs.length; i++) {
            if (fullArgs[i] === '+') total += 10
            if (fullArgs[i] === '-') total -= 10
        }

        await Browser.getInstance().player_controls_seek(total)

        if (total < 0) {
            msg.react('⏪')
        } else {
            msg.react('⏩')
        }
    }
}