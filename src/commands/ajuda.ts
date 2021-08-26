import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

export default class implements ICommand {
    public name = 'ajuda'
    public aliases = []
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        const embed = new MessageEmbed()

            embed.addField('Comandos de streaming', [
                '.p\n        dá play ou pause',
                '.seek **+** ou **-**\n        avança no vídeo',
                '.start **número de arquivo**\n        inicia a stream',
                '.stop\n        para a stream'
            ].join('\n'))

            embed.addField('Comandos de torrent', [
                '.set-torrent **<magnet uri>**\n        começa a baixar um torrent',
                '.view-torrent\n        mostra os status do torrent'
            ].join('\n'))

            msg.channel.send({ embeds: [embed] })
    }
}