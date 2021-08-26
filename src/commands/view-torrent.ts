import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import TorrentClient from "../torrent";
import * as Utils from "../utils"

export default class implements ICommand {
    public name = 'view-torrent'
    public aliases = []
    public ownerOnly = false

    public async exec(msg: Message, args: string[]): Promise<void> {
        const torrent = TorrentClient.getInstance().getTorrent()

        if (!torrent) {
            msg.channel.send('*Não há nenhum torrent adicionado. Adicione com `.set-torrent`*')
            return
        }

        const embed = new MessageEmbed()

        embed
            .setColor(4886754)
            .setFooter(`${Math.ceil(torrent.progress * 100)}% | ${Utils.bytes_to_human_readable(torrent.length)} | ${Utils.bytes_to_human_readable(torrent.downloadSpeed)}/s`)
            .setAuthor('Torrent downloader', 'https://neuroup.com.br/wp-content/uploads/2019/06/download-icon.png')

        Utils.torrents.sort_file_list(Utils.torrents.filter_invalid_extensions(torrent.files))
            .forEach((file, index) =>
                embed.addField(`${index + 1}. ${file.name}`, `${Math.ceil(file.progress * 100)}% | ${Utils.bytes_to_human_readable(file.length)}`, false))

        msg.channel.send({ embeds: [embed] })
    }
}