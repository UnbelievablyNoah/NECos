/**
 * @name NECos.ts
 * @description NECos entrypoint
 * @author imskyyc
 * @repository https://github.com/Nuclear-Engineering-Co/NECos
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

import { readFileSync } from "fs";
import { Configuration } from "./modules/Configuration.js";
import { Console } from "./modules/Console.js";
//import { Database } from "./modules/Database.js";
import { Bot } from "./bot/Bot.js";

import Knex from "knex";
import * as dbConfig from "../../config/dbconfig.js";

// Instantiate NECos object
const NECos = class NECos {
  debug = false;
  configuration = new Configuration("config/application.toml").configuration;
  bot = null;
  version = "";
  console = null;
  database = null;

  constructor() {
    this.debug =
      process.argv.includes("--debug") || process.argv.includes("-D");
    this.version =
      readFileSync(".git/refs/heads/master").toString().substring(0, 7) ||
      "Unknown";

    this.console = new Console(this);
    this.console.debug("Console class loaded.");
    this.console.starting("Beginning NECos framework initialization...");

    // Initialize database
    this.console.debug("Initializing database");
    this.database = Knex(dbConfig.default[process.env.NODE_ENV]);
    this.console.debug("Database initialized");

    // Run bot if enabled
    if (this.configuration.bot.enabled) {
      this.console.debug("Discord bot enabled. Starting...");
      try {
        this.bot = new Bot(this);
      } catch (error) {
        this.console.error(`Discord bot failed to start. ${error}`);
      }
    }

    this.console.ready(`NECos version ${this.version} successfully started.`);
  }
};

export default new NECos();
