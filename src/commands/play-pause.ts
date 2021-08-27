import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";
import Stream from "../stream";

export default class implements ICommand {
    public name = 'play'
    public aliases = [ 'p', 'pause' ]
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        if (!Stream.getInstance().isStreaming()) {
            msg.channel.send('Não estou transmitindo.')
            return
        }

        const browser = Browser.getInstance()
        const wasPaused = await browser.playerIsPaused()
        await browser.player_controls_pause_or_play()
        msg.react(wasPaused ? '▶️' : '⏸️')
    }
}