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

import { Configuration } from "./modules/Configuration.js";
import { Console } from "./modules/Console.js";
import { Bot } from "./bot/Bot.js";
import { API } from "./api/API.js";

import Knex from "knex";
import * as dbConfig from "../../config/dbconfig.js";
import { exec } from "child_process";

// Instantiate NECos object
const NECos = class NECos {
  debug = false;
  exited = false;
  configuration = new Configuration("config/application.toml").configuration;
  bot = null;
  api = null;
  version = "";
  console = null;
  database = null;

  constructor() {
    this.construct();
  }

  construct = async () => {
    // Process handles
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "development";
    }

    process.on("SIGINT", this.exit);
    process.on("SIGTERM", this.exit);
    process.on("uncaughtException", this.exit);

    this.debug =
      process.argv.includes("--debug") || process.argv.includes("-D");

    // try git rev-parse HEAD
    try {
      await new Promise<void>((resolve) => {
        exec("git rev-parse HEAD", (error, stdout) => {
          this.version = stdout.toString().substring(0, 7);

          resolve();
        });
      });
    } catch (error) {
      this.version = "Unknown";
    }

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

    // Run api if enabled
    if (this.configuration.api.enabled) {
      this.console.debug("REST API enabled. Starting...");
      try {
        this.api = new API(this);
      } catch (error) {
        this.console.error(`REST API failed to start. ${error}`);
      }
    }

    this.console.ready(`NECos version ${this.version} successfully started.`);
  };

  exit = async (signal) => {
    this.console.debug(`EXITING WITH CODE ${signal}`);

    try {
      this.database.destroy();
    } catch (error) {}

    this.console.info(`NECos exited.`);

    process.exit(signal);
  };
};

export default new NECos();
