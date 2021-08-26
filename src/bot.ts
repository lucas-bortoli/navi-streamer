import * as fs from 'fs'
import * as path from 'path'

import Discord from 'discord.js'

import Browser from './browser'
import TorrentClient from './torrent'
import Settings from './settings'
import ICommand from './types/ICommand'

class Bot {
    public client: Discord.Client

    public commands: Map<string, ICommand> = new Map()

    constructor() {
        this.client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_VOICE_STATES"] })

        this.client.on('messageCreate', (...args) => this.message_handler(...args))

        // dinamically load commands
        fs.readdirSync(path.join(__dirname, './commands/')).forEach(file => {
            const importedClass = require(path.join(__dirname, './commands/', file)).default
            const command: ICommand = new importedClass()

            this.commands.set(command.name, command)

            // register aliases too
            for (const alias of command.aliases) {
                this.commands.set(alias, command)
            }
        })

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

        if (this.commands.has(cmd)) {
            const command = this.commands.get(cmd)

            if (command.ownerOnly && Settings().owner_id !== msg.author.id)
                return // command is privileged

            command.exec(msg, args)
        } else {
            // unknown command, ignore
        }
    }

    private static inst: Bot
    public static getInstance(): Bot {
        if (!this.inst) this.inst = new Bot()
        return this.inst
    }
}

export default Bot