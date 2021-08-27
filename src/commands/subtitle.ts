import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import TorrentClient from "../torrent";
import * as path from 'path'
import * as Utils from "../utils"
import Stream from "../stream";

export default class implements ICommand {
    public name = 'subtitle'
    public aliases = ['legenda', 'sub']
    public ownerOnly = false

    public async exec(msg: Message, args: string[]): Promise<void> {
        const stream = Stream.getInstance()

        if (!stream.isStreaming()) {
            msg.channel.send('Não estou transmitindo nada no momento.')
            return
        }

        const fileRequestEmbed = new MessageEmbed()
        fileRequestEmbed.setTitle('Legendas')
        fileRequestEmbed.setDescription('<:upload:880430526190739496> Na sua próxima mensagem, envie (faça upload) um arquivo `srt` a ser usado como legenda.')
        fileRequestEmbed.setFooter('Formatos suportados: .srt')

        const fileRequestMessage = await msg.channel.send({ embeds: [fileRequestEmbed] })

        try {
            const messageWithFileUpload = (await msg.channel.awaitMessages({
                filter: (testMsg) => {
                    const att = testMsg.attachments.first()
                    return testMsg.author.id === msg.author.id &&
                        att &&
                        att.name.endsWith('srt') &&
                        att.size < 4 * 1000000 // has to be less than 4 MB
                },
                max: 1,
                time: 60 * 1000
            })).first()

            const attachment = messageWithFileUpload.attachments.first()
            fileRequestEmbed.setDescription(`Baixando arquivo \`${attachment.name}\``)
            fileRequestEmbed.setFooter('')

            fileRequestMessage.delete()

            let statusMsg = await msg.channel.send({ embeds: [fileRequestEmbed] })

            try {
                const outputFileName = await Utils.downloadFile(attachment.url, path.join(__dirname, '../../downloads/subs.srt'))

                await stream.setSubtitle(outputFileName)

                fileRequestEmbed.setDescription('✅ Legendas adicionadas')

                statusMsg.edit({ embeds: [fileRequestEmbed] })
            } catch (downloadError) {
                console.error(downloadError)
                statusMsg.edit('Erro ao baixar arquivo')
            }
        } catch (_) {
            fileRequestEmbed.setDescription('Timeout esgotado')
            fileRequestMessage.edit({ embeds: [fileRequestEmbed] })
            fileRequestMessage.react('🕙')
        }
    }
}