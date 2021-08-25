import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import Xvfb from "xvfb"
import Settings from "./settings"

class Display {
    private xvfb: Xvfb
    private window_manager: ChildProcessWithoutNullStreams
    private _old_display_variable: string

    constructor() {
        this.xvfb = new Xvfb({
            displayNum: Settings().xvfb_preferred_display_number || 800,
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

    private static inst: Display
    public static getInstance(): Display {
        if (!this.inst) this.inst = new Display()
        return this.inst
    }
}

export default Display