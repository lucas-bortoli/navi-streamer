const WebTorrent = require('webtorrent')
const DB = require('./database')

class TorrentClient {
    constructor() {
        this.wtorrent = new WebTorrent()

        if (DB.has('torrent'))
            this.wtorrent.add(DB.get('torrent'), { path: 'downloads/' })
    }

    /**
     * Seta o torrent principal
     * @param {string} magnet
     * @returns {Promise<WebTorrent.Torrent>}
     */
    setTorrent(magnet) {
        return new Promise((resolve, reject) => {
            try {
                const torrent = this.wtorrent.add(magnet, { path: 'downloads/' }, torrent => {
                    // remove older torrent (only one allowed at a time)
                    this.wtorrent.torrents.forEach(t => {
                        if (t.infoHash === torrent.infoHash) return
                        t.destroy({ destroyStore: true })
                    })

                    DB.set('torrent', magnet)
                    resolve(torrent)
                })

                torrent.once('error', reject)
            } catch (ex) {
                console.error(ex)
                reject(ex)
            }
        })
    }

    getTorrent() {
        return this.wtorrent.torrents[0]
    }

    /**
     * @returns {TorrentClient}
     */
    static getInstance() {
        if (!TorrentClient.__instance)
            TorrentClient.__instance = new TorrentClient()
        
        return TorrentClient.__instance
    }
}

module.exports = TorrentClient