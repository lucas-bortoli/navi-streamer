const fileChooser = document.getElementById('file_chooser') as HTMLInputElement
const player = document.getElementById('player') as HTMLVideoElement
const status_paragraph = document.getElementById('status') as HTMLParagraphElement
const sfx_play = document.getElementById('sfx_play') as HTMLAudioElement
const sfx_pause = document.getElementById('sfx_pause') as HTMLAudioElement

const pauseScreen = document.getElementById('pause_screen')

fileChooser.onchange = () => {
    const file = fileChooser.files[0]
    const url = URL.createObjectURL(file)

    player.src = url
    player.play()
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
}, 200)