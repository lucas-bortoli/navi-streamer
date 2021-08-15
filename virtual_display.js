const { spawn } = require('child_process')
const Xvfb = require('xvfb')
const Settings = require('./settings.json')

class Display {
    constructor() {
        this.xvfb = new Xvfb({
            displayNum: Settings.xvfb_preferred_display_number || 800,
            reuse: true
        })

        this.window_manager = null
    }

    start() {
        this.xvfb.startSync()
        this._old_display_variable = process.env.DISPLAY
        process.env.DISPLAY = this.display
        this.window_manager = spawn('openbox-session')
    }

    stop() {
        this.window_manager.kill('SIGKILL')
        this.xvfb.stopSync()
        process.env.DISPLAY = this._old_display_variable
    }

    get display() {
        return this.xvfb.display()
    }

    /**
     * @returns {Display}
     */
    static getInstance() {
        if (!Display.__instance)
            Display.__instance = new Display()

        return Display.__instance
    }
}

module.exports = Display