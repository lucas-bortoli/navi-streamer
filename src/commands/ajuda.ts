import ICommand from "../types/ICommand";
import { Message } from "discord.js"

export default class Ajuda implements ICommand {
    public name = 'ajuda'
    public ownerOnly = false
    
    public async exec(msg: Message, args: string[]): Promise<void> {
        
    }
}