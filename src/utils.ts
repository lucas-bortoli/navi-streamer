import { promisify } from 'util'
import { resolve } from 'path'

import WebTorrent from 'webtorrent';

export const fileUrl = (filePath: string, options = {}): string => {
	if (typeof filePath !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof filePath}`);
	}

	//@ts-expect-error
	const { r = true } = options;

	let pathName = filePath;
	if (r) {
		pathName = resolve(filePath);
	}

	pathName = pathName.replace(/\\/g, '/');

	// Windows drive letter must be prefixed with a slash.
	if (pathName[0] !== '/') {
		pathName = `/${pathName}`;
	}

	// Escape required characters for path components.
	// See: https://tools.ietf.org/html/rfc3986#section-3.3
	return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
}

export const shellExecute = promisify(require('child_process').exec)
export const sleep = ms => new Promise<void>(r => setTimeout(() => r(), ms))

export const bytes_to_human_readable = (bytes: number): string => {
	var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 B';
	//@ts-expect-error
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	//@ts-expect-error
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export const torrents = {
	filter_invalid_extensions: (files: WebTorrent.TorrentFile[]): WebTorrent.TorrentFile[] =>
		files.filter(t => !t.name.endsWith('.srt') && !t.name.endsWith('.txt')),

	sort_file_list: (files: WebTorrent.TorrentFile[]): WebTorrent.TorrentFile[] =>
		files.sort((a, b) => a.name.localeCompare(b.name)),

	get_torrent_as_list: (torrent: WebTorrent.Torrent): string[] =>
		module.exports.torrents.filter_invalid_extensions(torrent.files)
			.map((file, index) => `${index + 1}. ${file.name}\n    ${Math.ceil(file.progress * 100)}% (${module.exports.bytes_to_human_readable(file.downloaded)} de ${module.exports.bytes_to_human_readable(file.length)} baixados)`).join('\n')
	

}