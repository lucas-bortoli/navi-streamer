const Discord = require('discord.js')
const Browser = require('./browser')
const TorrentClient = require('./torrent')
const Utils = require('./utils')
const Settings = require('./settings.json')

class Bot {
    constructor() {
        this.client = new Discord.Client({ intents: [ "GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_VOICE_STATES" ]})

        this.client.on('messageCreate', (...args) => this.message_handler(...args))

        setInterval(() => this.update_presence(), 30000)   
    }

    async login() {
        await Browser.getInstance().launch()
        await this.client.login(Settings.discord_bot_token)
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
     * Handler de mensagens
     * @param {Discord.Message} msg 
     */
    async message_handler(msg) {
        if (!msg.content.startsWith('.') || !msg.member || msg.author.bot) return

        const args = msg.content.split(' ')
        let cmd = args.shift().replace('.', '')

        if (cmd === 'play') {
            await Browser.getInstance().player_controls_play()
            msg.reply(`*Retomei o vídeo*`)
        } else if (cmd === 'pause') {
            await Browser.getInstance().player_controls_pause()
            msg.reply(`*Pausei o vídeo*`)
        } else if (cmd === 'ajuda' || cmd === 'help' || cmd === '?') {
            const embed = new Discord.MessageEmbed()
            embed.addField('Comandos de streaming', [ 
                '.play', 
                '.pause', 
                '.seek **++++++** ou **---**'
            ].join('\n'))
            embed.addField('Comandos de torrent', [ 
                '.set-torrent **<magnet uri>**', 
                '.view-torrent'
            ].join('\n'))
            msg.reply({ embeds: [ embed ]})  
        } else if (cmd.startsWith('seek')) {
            let total = 0
            for (let i = 0; i < cmd.length; i++) {
                if (cmd[i] === '+') total += 10
                if (cmd[i] === '-') total -= 10
            }
            await Browser.getInstance().player_controls_seek(total)
            msg.reply(`*Avançados **${total}** segundos para ${ total <= 0 ? 'trás' : 'frente'}*`)
        } else if (cmd === 'start') {
            const torrent = TorrentClient.getInstance().getTorrent()
            const video_id = parseInt(args.shift())

            if (!msg.member.voice.channel)
                return msg.reply('*Você não está em um canal de voz!*')
            if (!torrent)
                return msg.reply('*Não há nenhum torrent baixado!*')
            if (!video_id || !Utils.torrents.filter_invalid_extensions(torrent.files)[video_id-1])
                return msg.reply('*Qual é o número do arquivo a ser tocado? ex. `.start 2`*: ```' + Utils.torrents.get_torrent_as_list(torrent) + '```')
            
            msg.reply(`*Aguarde, estou tentando entrar no canal...*`)

            const channelName = msg.member.voice.channel.name
            const guildId = msg.guildId
            const bw = Browser.getInstance()

            try {
                await bw.focusGuild(guildId)
                await bw.joinVoiceChannel(channelName)
                await bw.player_set_video_file('downloads/' + Utils.torrents.filter_invalid_extensions(torrent.files)[video_id-1].path)

                msg.reply(`*Playback iniciado.*`)
            } catch(ex) {
                console.error(ex)
                return msg.reply(`*Houve um erro ao entrar no canal de voz!*`)
            }
        } else if (cmd === 'stop') {
            await Browser.getInstance().exitVoiceChannel()
            msg.reply(`*Parando steam...*`)
        } else if (cmd === 'set-torrent') {
            const magnet_link = args.shift()
            console.log(magnet_link)
            if (!magnet_link)
                return msg.reply('Um link magnet não foi dado')

            try {
                const torrent = await TorrentClient.getInstance().setTorrent(magnet_link)

                msg.reply([
                    'O torrent foi adicionado. Esses são os arquivos dele:',
                    '```',
                    Utils.torrents.get_torrent_as_list(torrent),
                    '```'
                ].join('\n'))
            } catch (ex) {
                msg.reply('Houve um erro ao adicionar o torrent. O link é inválido?')
            }
        } else if (cmd === 'view-torrent') {
            const torrent = TorrentClient.getInstance().getTorrent()

            if (!torrent)
                return msg.reply('Não há nenhum torrent adicionado')

            msg.reply([
                `${Math.ceil(torrent.progress * 100)}% concluído | ${Utils.bytes_to_human_readable(torrent.downloadSpeed)}/s`,
                '```',
                Utils.torrents.get_torrent_as_list(torrent),
                '```'
            ].join('\n'))
        }
    }

    /**
     * @returns {Bot}
     */
    static getInstance() {
        if (!Bot.__instance)
            Bot.__instance = new Bot()

        return Bot.__instance
    }
}

module.exports = Bot