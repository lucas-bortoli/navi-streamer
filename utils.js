const { promisify } = require('util')
const path = require('path')

function fileUrl(filePath, options = {}) {
	if (typeof filePath !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof filePath}`);
	}

	const {resolve = true} = options;

	let pathName = filePath;
	if (resolve) {
		pathName = path.resolve(filePath);
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

module.exports.fileUrl = fileUrl
module.exports.shellExecute = promisify(require('child_process').exec)
module.exports.sleep = ms => new Promise(r => setTimeout(() => r(), ms))
module.exports.bytes_to_human_readable = function(bytes) {
	var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 B';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

module.exports.torrents = {}
module.exports.torrents.filter_invalid_extensions = (torrent_list) =>
	torrent_list.filter(t => !t.name.endsWith('.srt') && !t.name.endsWith('.txt'))
module.exports.torrents.get_torrent_as_list = (torrent) =>
	module.exports.torrents.filter_invalid_extensions(torrent.files)
		.map((file, index) => `${index + 1}. ${file.name}\n    ${Math.ceil(file.progress * 100)}% (${module.exports.bytes_to_human_readable(file.downloaded)} de ${module.exports.bytes_to_human_readable(file.length)} baixados)`).join('\n')