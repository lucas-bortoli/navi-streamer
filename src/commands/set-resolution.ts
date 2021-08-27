import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import Stream from "../stream";

export default class implements ICommand {
    public name = 'qualidade'
    public aliases = ['resolução', 'res', 'q']
    public ownerOnly = false

    public async exec(msg: Message, args: string[]): Promise<void> {
        const qualidades = {
            '144': { width: 256, height: 144 },
            '240': { width: 426, height: 240 },
            '360': { width: 640, height: 360 },
            '480': { width: 854, height: 480 },
            '720': { width: 1280, height: 720 }
        }

        const stream = Stream.getInstance()
        const qualidade = (args.shift() || '').replace('p', '')

        if (!stream.isStreaming()) {
            msg.channel.send('Não estou transmitindo nada no momento.')
            return
        }

        if (!qualidades[qualidade]) {
            msg.channel.send(`Essas são as qualidades possíveis: \`${Object.keys(qualidades).map(q => q + 'p').join(', ')}\``)
            return  
        }
        
        await Browser.getInstance().movie_page.setViewport(qualidades[qualidade])
        msg.react('✅')
    }
}