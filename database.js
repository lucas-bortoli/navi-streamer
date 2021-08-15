const JSONDB = require('simple-json-db')

module.exports = new JSONDB('db.json', { asyncWrite: true })