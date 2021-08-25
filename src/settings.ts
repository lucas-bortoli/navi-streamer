import { readFileSync } from 'fs'
import { join } from 'path'

interface Settings {
    discord_bot_token: string
    owner_id: string,
    xvfb_preferred_display_number: number
}

let _stg: Settings

export default (): Settings => {
    if (!_stg) {
        const fileData = readFileSync(join(__dirname, '../settings.json'), { encoding: 'utf8' })
        _stg = JSON.parse(fileData)
    }

    return _stg
}