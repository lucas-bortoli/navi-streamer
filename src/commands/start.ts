import ICommand from "../types/ICommand";
import { Message, MessageEmbed, StageChannel, VoiceChannel } from "discord.js"

import Browser from "../browser";
import TorrentClient from "../torrent";
import * as Utils from "../utils"

import Stream from "../stream";

export default class implements ICommand {
    public name = 'start'
    public aliases = []
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        const stream = Stream.getInstance()

        if (stream.isStreaming()) {
            msg.channel.send('Já estou transmitindo! Use `.stop` para parar.')
            return
        }

        const torrent = TorrentClient.getInstance().getTorrent()
        const video_id = parseInt(args.shift())

        if (!msg.member.voice.channel) {
            msg.channel.send('*Você não está em um canal de voz*')
            return
        } else if (!torrent) {
            msg.channel.send('*Não há nenhum torrent baixado*')
            return
        }

        const files = Utils.torrents.sort_file_list(Utils.torrents.filter_invalid_extensions(torrent.files))

        if (!video_id || !files[video_id - 1]) {
            msg.channel.send('*Qual é o número do arquivo a ser tocado? ex. `.start 2`* | veja os arquivos com `.view-torrent`')
            return
        }

        let statusMsg = await msg.channel.send('<a:spinner:880417215231443025> Aguarde...')

        const channelName = msg.member.voice.channel.name
        const guildId = msg.guildId
        const bw = Browser.getInstance()
        try {
            await stream.start(msg.guild, msg.member.voice.channel as VoiceChannel)

            /*await bw.focusGuild(guildId)
            statusMsg = await statusMsg.edit(statusMsg.content + '\n<:blank:880424437118287972> Entrando no canal de voz...')
            await Utils.sleep(1000)
            await bw.joinVoiceChannel(channelName)
            statusMsg = await statusMsg.edit(statusMsg.content + '\n<:blank:880424437118287972> Abrindo arquivo de vídeo...')
            await Utils.sleep(1000)
            await bw.player_set_video_file('../downloads/' + files[video_id - 1].path)*/
            await stream.setVideoFile('../downloads/' + files[video_id - 1].path)
            
            statusMsg.edit(statusMsg.content.replace('a:spinner:880417215231443025', ':blank:880424437118287972') + `\n<:streaming:880419018572439612> **Stream iniciada**`)
        } catch (ex) {
            console.error(ex)
            statusMsg.edit(statusMsg.content + `\n<:error:880419556546469898> **Houve um erro ao entrar no canal de voz**`)
        }
    }
}