const puppeteer = require('puppeteer-core')
const child_process = require('child_process')
const { sleep, shellExecute, fileUrl } = require('./utils')
const PulseAudio = require('./pulseaudio')

class Browser {
    async launch() {
        this.browser = await puppeteer.launch({
            userDataDir: './usrdata',
            executablePath: '/usr/bin/google-chrome',
            env: Object.assign({}, process.env, { 'PULSE_SERVER': 'none' }),
            args: [ ],
            headless: false
        })

        this.discord_page = await this.browser.newPage()
        this.movie_page = await this.browser.newPage()

        this.movie_page.setViewport({ width: 848, height: 480 })
        this.movie_page.goto(fileUrl('ui/player_page.html'))
        
        // setInterval(() => PulseAudio.muteProcessTree(this.browser.process().pid), 10000)
    }

    /**
     * Navega até /channels/:guild_id/00000
     * @param {string} guild_id 
     */
    async focusGuild(guild_id) {
        await this.discord_page.bringToFront()
        return await this.discord_page.goto(`https://discord.com/channels/${guild_id}/32423`, { waitUntil: 'networkidle0' })
    }

    /**
     * Entra em um canal de voz. A GUILD DEVE ESTAR "FOCADA" ANTES (ver focusGuild)
     * @param {string} channel_name 
     */
    async joinVoiceChannel(channel_name) {
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

    async exitVoiceChannel() {
        await this.discord_page.mouse.click(100, 100) // click somewhere to gain focus
        await this.discord_page.evaluate(() => {
            let disconnect_btn = document.querySelector('button[aria-label="Disconnect"]')
            if (disconnect_btn) disconnect_btn.click()
        })
    }

    async stopStream() {
        try { this.exitVoiceChannel() } catch(_) {}

        this.movie_page.reload()
    }

    /**
     * Seleciona o arquivo a ser exibido
     * @param {string} file 
     */
    async player_set_video_file(file) {
        console.log('Abrindo arquivo', file)

        const fileChooserHandle = await this.movie_page.$('#file_chooser')
        await fileChooserHandle.uploadFile(file)
        await this.movie_page.setViewport({ width: 1280, height: 720 })
        await this.player_controls_play()
        // PulseAudio.setSinkInputMute(PulseAudio.findSinkIdFromPID(this.browser.process().pid), true)
    }

    /**
     * Executa um script na página de player
     * @param {string|function} script 
     */
    player_page_eval(script) {
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
     * Pula no vídeo
     */
    player_controls_seek(relative) { return this.player_page_eval(`Seek(${relative})`) }

    /**
     * 
     * @returns {Browser}
     */
    static getInstance() {
        if (!Browser.__instance)
            Browser.__instance = new Browser()

        return Browser.__instance
    }
}

module.exports = Browser