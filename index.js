const Display = require('./virtual_display')
const Bot = require('./bot.js')
const Browser = require('./browser')
const TorrentClient = require('./torrent')

Display.getInstance().start()
TorrentClient.getInstance()
Bot.getInstance().login()

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, exitCode) {
    if (options.cleanup) {
        Bot.getInstance().client.destroy()
        TorrentClient.getInstance().wtorrent.destroy()
        Browser.getInstance().browser.close()
        Display.getInstance().stop()
    }
    if (exitCode || exitCode === 0) {
        console.log('Fechando...')
    }
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));