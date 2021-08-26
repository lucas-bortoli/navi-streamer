const fileChooser = document.getElementById('file_chooser') as HTMLInputElement
const subtitleFileChooser = document.getElementById('subtitle_file_chooser') as HTMLInputElement
const player = document.getElementById('player') as HTMLVideoElement
const subtitleTextElement = document.getElementById('subtitle') as HTMLParagraphElement
const status_paragraph = document.getElementById('status') as HTMLParagraphElement
const sfx_play = document.getElementById('sfx_play') as HTMLAudioElement
const sfx_pause = document.getElementById('sfx_pause') as HTMLAudioElement

const pauseScreen = document.getElementById('pause_screen')

let subtitle;

fileChooser.onchange = () => {
    const file = fileChooser.files[0]
    const url = URL.createObjectURL(file)

    player.src = url
    player.play()
}

subtitleFileChooser.onchange = () => {
    const file = subtitleFileChooser.files[0]

    // https://stackoverflow.com/a/65890220
    const read = (utf8 = true) => {
        const reader = new FileReader()
        reader.readAsText(file, utf8 ? 'UTF-8' : 'iso-8859-1')
        reader.onload = () => {
            let result = reader.result as string
            if(utf8 && result.match(/�/)) {
                read(false)
                console.log('The file encoding is not utf-8! Trying CP1251...');
            } else {
                //@ts-expect-error
                subtitle = new libSRT(result)
            }
        }
    }

    read()
}

const Play = () => {
    sfx_play.play()
    player.play()
}

const Pause = () => {
    sfx_pause.play()
    player.pause()
}

const PauseOrPlay = () => {
    if (player.paused) {
        Play()
    } else {
        Pause()
    }
}

const Seek = (relative) => {
    player.currentTime += relative
}

const SetSubtitleOffset = (offset: number) => {
    if (subtitle)
        subtitle.sub_offset = offset
}

var toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":")
}

setInterval(() => {
    status_paragraph.innerText = toHHMMSS(Math.floor(player.currentTime)) + ' de ' + toHHMMSS(Math.floor(player.duration || 0))

    pauseScreen.classList.toggle('hidden', !player.paused)

    if (subtitle) {
        const subs = subtitle.getSubtitleAtTimestamp(player.currentTime)

        subtitleTextElement.innerHTML = subs.map(s => s.text
            .replace('�', 'á')
            .replace('<br />', '<br>')
        ).join('<br>')
    }
}, 500)