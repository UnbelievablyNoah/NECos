/**
 * @name NECos.ts
 * @description NECos entrypoint
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
 */

// Initialize configuration
const Configuration = require("./modules/Configuration")

// Instantiate NECos object
const NECos = class NECos extends Configuration {
  debug = false
  version = ""
  console = null
  database = null

  constructor() {
    super("config/application.toml") // Initializes configuration

    this.debug = process.argv.includes("--debug") || process.argv.includes("-D")
    this.console = new (require("./modules/Console"))(this)
    this.console.debug("Console class loaded.")
    this.console.debug("Beginning NECos framework initialization...")

    // Initialize database
    this.console.debug("Initializing database")
    this.database = new (require("./modules/Database"))(this)
    this.console.debug("Database initialized")

    console.log(process.argv)
  }
}

module.exports = new NECos();