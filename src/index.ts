import Display from './virtual_display'
import Bot from './bot'
import Browser from './browser'
import TorrentClient from './torrent'

Display.getInstance().start()
TorrentClient.getInstance()
Bot.getInstance().login()

process.stdin.resume();//so the program will not close instantly

async function exitHandler(options, exitCode) {
        Bot.getInstance().client.destroy()
        TorrentClient.getInstance().destroy()
        await Browser.getInstance().close()
        Display.getInstance().stop()
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