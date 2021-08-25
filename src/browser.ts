import Puppeteer from "puppeteer-core"

import { sleep, shellExecute, fileUrl } from './utils'

class Browser {
    private browser: Puppeteer.Browser
    private movie_page: Puppeteer.Page
    private discord_page: Puppeteer.Page
    
    public async launch() {
        this.browser = await Puppeteer.launch({
            userDataDir: '../usrdata',
            executablePath: '/usr/bin/google-chrome',
            // disable sounds by pointing Chromium's audio engine to nowhere
            env: Object.assign({}, process.env, { 'PULSE_SERVER': 'none' }),
            args: [ '--alsa-output-device=none', '--alsa-input-device=none' ],
            headless: false
        })

        this.discord_page = await this.browser.newPage()
        this.movie_page = await this.browser.newPage()

        this.movie_page.setViewport({ width: 848, height: 480 })
        this.movie_page.goto(fileUrl('ui/player_page.html'))
    }

    /**
     * Navega até /channels/:guild_id/00000
     * @param {string} guild_id 
     */
    public async focusGuild(guild_id) {
        await this.discord_page.bringToFront()
        return await this.discord_page.goto(`https://discord.com/channels/${guild_id}/32423`, { waitUntil: 'networkidle0' })
    }

    /**
     * Entra em um canal de voz. A GUILD DEVE ESTAR "FOCADA" ANTES (ver focusGuild)
     * @param {string} channel_name 
     */
    public async joinVoiceChannel(channel_name) {
        // desconectar do canal anterior (se houver)
        await this.discord_page.bringToFront()

        // agora que a janela está em foco, pegar o ID dela com xdotool
        const window_id = await shellExecute(`xdotool getactivewindow`)

        await this.discord_page.setViewport({ width: 1280, height: 4096 })
        await this.discord_page.mouse.click(100, 100) // click somewhere to gain focus
        await this.exitVoiceChannel()
        await sleep(1000)
        await this.discord_page.click(`[aria-label^="${channel_name} (voice channel)"]`)
        await sleep(1000)
        await this.discord_page.bringToFront()
        await this.discord_page.click('button[aria-label="Share Your Screen"]')
        await sleep(1000)
        
        // ugly as hell... navigate through the share screen modal dialog and confirm
        await shellExecute('xdotool key --delay 100 shift+Tab shift+Tab Right Right Tab Down Down Tab space Tab Tab space')
    }

    public async exitVoiceChannel() {
        await this.discord_page.mouse.click(100, 100) // click somewhere to gain focus
        try {
            await this.discord_page.click('button[aria-label="Disconnect"]')
        } catch(_) {
            // don't do anything, because we know that the button may actually not exist
            // and its existence is optional
        }
    }

    public async stopStream() {
        try { this.exitVoiceChannel() } catch(_) {}

        this.movie_page.reload()
    }

    /**
     * Seleciona o arquivo a ser exibido
     */
    public async player_set_video_file(file: string) {
        console.log('Abrindo arquivo', file)

        const fileChooserHandle = await this.movie_page.$('#file_chooser')
        await fileChooserHandle.uploadFile(file)
        await this.movie_page.setViewport({ width: 1280, height: 720 })
        await this.player_controls_play()
    }

    /**
     * Executa um script na página de player
     */
    public player_page_eval(script: string) {
        return this.movie_page.evaluate(script)
    }

    /**
     * Toca o vídeo
     */
    player_controls_play() { 
        return this.player_page_eval('Play()')
    }

    /**
     * Pausa o vídeo
     */
    player_controls_pause() { return this.player_page_eval('Pause()') }

    /**
     * Pausa ou toca o vídeo
     */
    player_controls_pause_or_play() { return this.player_page_eval('PauseOrPlay()') }

    /**
     * Pula no vídeo
     */
    player_controls_seek(relative) { return this.player_page_eval(`Seek(${relative})`) }

    public close(): void {
        try {
            this.browser.close()
        } catch(ex) {
            // todo...
        }
    }

    private static inst: Browser
    public static getInstance(): Browser {
        if (!this.inst) this.inst = new Browser()
        return this.inst
    }
}

export default Browser