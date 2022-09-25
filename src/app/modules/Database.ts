/**
 * @name Database.ts
 * @description NECos database wrapper class
 * @author imskyyc
 * @repository https://github.com/Nuclear-Engineering-Co/NECos-Bun
 * @license AGPL3
 * @copyright Copyright (C) 2022 imskyyc (https://github.com/imskyyc)
   This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

 * @param { typeof NECos }
 */

const Knex = require("knex");
module.exports = class Database {
    NECos = null
    console = null
    configuration = null
    connection = null

    constructor(NECos) {
        this.NECos = NECos
        this.console = NECos.console
        this.configuration = NECos.configuration.app.database

        this.console.debug("Creating database pool...")
        this.connection = Knex(this.configuration) 
        this.console.connection("Database pool created. Database connection ready.")
    }
}