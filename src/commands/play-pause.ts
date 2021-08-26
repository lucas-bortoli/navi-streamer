import ICommand from "../types/ICommand";
import { Message, MessageEmbed } from "discord.js"

import Browser from "../browser";

export default class implements ICommand {
    public name = 'play'
    public aliases = [ 'p', 'pause' ]
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        await Browser.getInstance().player_controls_pause_or_play()
        msg.react('✅')
    }
}