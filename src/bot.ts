import * as Discord from 'discord.js'

import Browser from './browser'
import TorrentClient from './torrent'
import * as Utils from './utils'
import Settings from './settings'

class Bot {
    public client: Discord.Client

    constructor() {
        this.client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_VOICE_STATES"] })

        this.client.on('messageCreate', (...args) => this.message_handler(...args))

        setInterval(() => this.update_presence(), 30000)
    }

    async login() {
        await Browser.getInstance().launch()
        await this.client.login(Settings().discord_bot_token)
        this.update_presence()
    }

    async update_presence() {
        const torrent = TorrentClient.getInstance().getTorrent()

        if (torrent) {
            let progress = Math.ceil(torrent.progress * 100)
            this.client.user.setActivity(progress === 100 ? 'Download concluído!' : `Download: ${progress}%`)
        } else {
            this.client.user.setActivity('Nenhum torrent adicionado.')
        }
    }

    /**
     * @param {Discord.TextChannel} channel 
     * @param  {...any} args 
     */
    async send_message(channel, ...args) {
        try {
            const msg = await channel.send(...args)

            setTimeout(() => msg.delete(), 10 * 1000)
        } catch (ex) {
            // silent fail
        }
    }

    /**
     * Handler de mensagens
     * @param {Discord.Message} msg 
     */
    async message_handler(msg) {
        if (!msg.content.startsWith('.') || !msg.member || msg.author.bot) return

        const args = msg.content.split(' ')
        let cmd = args.shift().replace('.', '')

        if (cmd === 'p') {
            await Browser.getInstance().player_controls_pause_or_play()
            this.send_message(msg.channel, `*Ok*`)
        } else if (cmd === 'ajuda' || cmd === 'help' || cmd === '?') {
            const embed = new Discord.MessageEmbed()
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
            this.send_message(msg.channel, { embeds: [embed] })
        } else if (cmd.startsWith('seek')) {
            let total = 0
            for (let i = 0; i < cmd.length; i++) {
                if (cmd[i] === '+') total += 10
                if (cmd[i] === '-') total -= 10
            }
            await Browser.getInstance().player_controls_seek(total)
            this.send_message(msg.channel, `*Avançados **${total}** segundos*`)
        } else if (cmd === 'start') {
            const torrent = TorrentClient.getInstance().getTorrent()
            const video_id = parseInt(args.shift())

            if (!msg.member.voice.channel)
                return this.send_message(msg.channel, '*Você não está em um canal de voz*')
            if (!torrent)
                return this.send_message(msg.channel, '*Não há nenhum torrent baixado*')

            const files = Utils.torrents.sort_file_list(Utils.torrents.filter_invalid_extensions(torrent.files))

            if (!video_id || !files[video_id - 1])
                return this.send_message(msg.channel, '*Qual é o número do arquivo a ser tocado? ex. `.start 2`* | veja os arquivos com `.view-torrent`')

            this.send_message(msg.channel, `*Entrando no canal*`)

            const channelName = msg.member.voice.channel.name
            const guildId = msg.guildId
            const bw = Browser.getInstance()

            try {
                await bw.focusGuild(guildId)
                await bw.joinVoiceChannel(channelName)
                await bw.player_set_video_file('../downloads/' + files[video_id - 1].path)

                this.send_message(msg.channel, `*Stream iniciada*`)
            } catch (ex) {
                console.error(ex)
                return this.send_message(msg.channel, `*Houve um erro ao entrar no canal de voz*`)
            }
        } else if (cmd === 'stop') {
            await Browser.getInstance().stopStream()
            this.send_message(msg.channel, `*Parando stream*`)
        } else if (cmd === 'set-torrent') {
            const magnet_link = args.shift()
            console.log(magnet_link)
            if (!magnet_link)
                return this.send_message(msg.channel, 'Um link magnet não foi dado')

            try {
                const torrent = await TorrentClient.getInstance().setTorrent(magnet_link)

                const embed = new Discord.MessageEmbed()

                embed
                    .setColor(4886754)
                    .setFooter(`${Math.ceil(torrent.progress * 100)}% | ${Utils.bytes_to_human_readable(torrent.length)} | ${Utils.bytes_to_human_readable(torrent.downloadSpeed)}/s`)
                    .setAuthor('Torrent downloader', 'https://neuroup.com.br/wp-content/uploads/2019/06/download-icon.png')

                Utils.torrents.sort_file_list(Utils.torrents.filter_invalid_extensions(torrent.files))
                    .forEach((file, index) =>
                        embed.addField(`${index + 1}. ${file.name}`, `${Math.ceil(file.progress * 100)}% | ${Utils.bytes_to_human_readable(file.length)}`, false))

                this.send_message(msg.channel, { content: '*Torrent adicionado*', embeds: [embed] })
            } catch (ex) {
                this.send_message(msg.channel, '*Houve um erro ao adicionar o torrent*')
            }
        } else if (cmd === 'view-torrent') {
            const torrent = TorrentClient.getInstance().getTorrent()

            if (!torrent)
                return this.send_message(msg.channel, '*Não há nenhum torrent adicionado*')

            const embed = new Discord.MessageEmbed()

            embed
                .setColor(4886754)
                .setFooter(`${Math.ceil(torrent.progress * 100)}% | ${Utils.bytes_to_human_readable(torrent.length)} | ${Utils.bytes_to_human_readable(torrent.downloadSpeed)}/s`)
                .setAuthor('Torrent downloader', 'https://neuroup.com.br/wp-content/uploads/2019/06/download-icon.png')

            Utils.torrents.sort_file_list(Utils.torrents.filter_invalid_extensions(torrent.files))
                .forEach((file, index) =>
                    embed.addField(`${index + 1}. ${file.name}`, `${Math.ceil(file.progress * 100)}% | ${Utils.bytes_to_human_readable(file.length)}`, false))

            this.send_message(msg.channel, { embeds: [embed] })
        }
    }

    private static inst: Bot
    public static getInstance(): Bot {
        if (!this.inst) this.inst = new Bot()
        return this.inst
    }
}

export default Bot