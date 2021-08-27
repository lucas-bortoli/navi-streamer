import { Guild, VoiceChannel } from "discord.js"

import * as Utils from "./utils"
import Browser from "./browser"
import Settings from "./settings"

class NotStreamingError extends Error {}

class Stream {
    public readonly videoFile: string
    public readonly subFile: string

    public streamGuild?: Guild
    public voiceChannel?: VoiceChannel

    private clockIntervalID: NodeJS.Timer

    /**
     * Começa a stream em certo canal.
     */
    public async start(guild: Guild, voiceChannel: VoiceChannel): Promise<void> {
        const browser = Browser.getInstance()
        await browser.focusGuild(guild.id)
        await Utils.sleep(1000)
        await browser.joinVoiceChannel(voiceChannel.name)
        await Utils.sleep(1000)

        this.voiceChannel = voiceChannel
        this.streamGuild = guild
        this.clockIntervalID = setInterval(() => this.onClockTick(), 15 * 1000)
    }

    /**
     * Para a stream
     */
    public async stop(): Promise<void> {
        this.voiceChannel.members.first().voice.disconnect("Stream finalizada")
        await Browser.getInstance().exitVoiceChannel()
        await Browser.getInstance().movie_page.reload()

        this.voiceChannel = null
        this.streamGuild = null
        clearInterval(this.clockIntervalID)
    }

    public isStreaming(): boolean {
        return this.voiceChannel && this.voiceChannel.members.has(Settings().streaming_account_user_id)
    }

    public async setSubtitle(subtitleFile: string): Promise<void> {
        if (this.isStreaming()) {
            await Browser.getInstance().player_set_subtitles(subtitleFile)
        } else {
            throw new NotStreamingError('Não há nenhuma stream atualmente')
        }
    }

    public async setVideoFile(videoFile: string): Promise<void> {
        if (this.isStreaming()) {
            await Browser.getInstance().player_set_video_file(videoFile)    
        } else {
            throw new NotStreamingError('Não há nenhuma stream atualmente')
        }
    }

    /**
     * Realiza ações periódicas, como a checagem de usuários em um voice channel.
     */
    private async  onClockTick(): Promise<void> {
        if (this.isStreaming()) {
            // check amount of users in channel
            const usersInVoiceChannel = this.voiceChannel.members.filter(m => m.user.bot === false)
            if (usersInVoiceChannel.size === 1 && usersInVoiceChannel.first().id === Settings().streaming_account_user_id) {
                // there's only us in the channel, so stop the stream
                await this.stop()
            }
        }
    }

    private static __inst: Stream
    public static getInstance(): Stream {
        if (!this.__inst) this.__inst = new Stream()
        return this.__inst
    }
}

export default Stream