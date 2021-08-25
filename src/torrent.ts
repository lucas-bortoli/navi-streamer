import WebTorrent from "webtorrent"
import Database from "./database"

class TorrentClient {
    private wtorrent: WebTorrent.Instance

    constructor() {
        this.wtorrent = new WebTorrent()
        
        if (Database.has('torrent'))
            this.wtorrent.add(Database.get('torrent') as unknown as string, { path: '../downloads/' })
    }

    /**
     * Seta o torrent principal
     */
    setTorrent(magnet: string): Promise<WebTorrent.Torrent> {
        return new Promise((resolve, reject) => {
            try {
                const torrent = this.wtorrent.add(magnet, { path: '../downloads/' }, torrent => {
                    // remove older torrent (only one allowed at a time)
                    this.wtorrent.torrents.forEach(t => {
                        if (t.infoHash === torrent.infoHash) return
                        t.destroy({ destroyStore: true })
                    })

                    Database.set('torrent', magnet as unknown as object)

                    resolve(torrent)
                })

                torrent.once('error', reject)
            } catch (ex) {
                console.error(ex)
                reject(ex)
            }
        })
    }

    getTorrent(): WebTorrent.Torrent {
        return this.wtorrent.torrents[0]
    }

    public destroy(): void {
        return this.wtorrent.destroy()
    }

    private static inst: TorrentClient
    public static getInstance(): TorrentClient {
        if (!this.inst) this.inst = new TorrentClient()
        return this.inst
    }
}

export default TorrentClient