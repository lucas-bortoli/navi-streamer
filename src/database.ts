import JSONdb from "simple-json-db"
import { join } from "path"
export default new JSONdb(join(__dirname, '../db.json'), { asyncWrite: true })