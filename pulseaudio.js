const Utils = require('./utils')

const index_line_test = /index: (\d+)/
const pid_line_test = /application\.process\.id = "(\d+?)"/

class PulseAudio {
    /**
     * Retorna o id do sink de um determinado programa.
     * Pode ser usado para mutar um aplicativo, por exemplo.
     * @param {string} pid 
     */
    static async findSinkIdFromPID(pid) {
        const lines = await Utils.shellExecute('pacmd list-sink-inputs')

        let index

        // iterate over every line
        for (const line of lines.stdout.split('\n')) {
            const index_line_matches = index_line_test.exec(line)
            
            // check if it matches "Index: xxx" line
            if (index_line_matches) {
                index = index_line_matches[1]
            } else {
                // check if it matches "application.process.id" line and return last index in output
                const pid_line_matches = pid_line_test.exec(line)

                if (pid_line_matches && pid_line_matches[1] === pid)
                    return index
            }
        }

        return null
    }

    /**
     * Muta o áudio de um programa.
     * @param {string|number} sink_id,
     * @param {boolean} muted
     */
    static async setSinkInputMute(sink_id, mute) {
        if (!sink_id)
            return

        return await Utils.shellExecute(`pacmd set-sink-input-mute ${sink_id.toString()} ${mute ? 1 : 0}`)
    }

    /**
     * Muta um processo e todos os processos filhos
     * @param {string} parent_pid 
     * @param {boolean} mute 
     */
    static async muteProcessTree(parent_pid, mute) {
        // pegar os filhos de um processo
        const children = (await Utils.shellExecute(`pgrep -P ${parent_pid}`)).stdout.split('\n')

        for (const child_pid of children) {
            const sink_id = await this.findSinkIdFromPID(child_pid)
            console.log(child_pid, sink_id)
            await this.setSinkInputMute(sink_id)
        }
    }
}

module.exports = PulseAudio