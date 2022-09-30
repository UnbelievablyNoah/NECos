/**
 * @name Bot.ts
 * @description NECos discord bot class
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

// Decalre dirname
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  Collection,
  Client,
  GatewayIntentBits as Intents,
} from 'discord.js';
import { readdirSync } from 'fs'
export class Bot {
  NECos = null;
  console = null;
  configuration = null;
  client = null;

  // Declare utility functions
  generatePresence = null;
  loadCommands = null;
  createEmbed = null;

  constructor(NECos) {
    this.constructBot(NECos);
  }

  constructBot = async (NECos) => {
    this.NECos = NECos;
    this.console = NECos.console;
    this.configuration = NECos.configuration.bot;

    // Load utility functions
    const utilities = readdirSync(`${__dirname}/utility`);
    for (const file of utilities) {
      const name = file.replace(".ts", "").replace(".js", "");
      const utilFunction = await import(`./utility/${file}`);

      this[name] = utilFunction.default.bind(null, this);
    }

    // Create client
    this.client = new Client({
      presence: {
        status: "idle",
        activities: [
          {
            name: "Starting up...",
            type: 1,
          },
        ],
      },

      intents: [
        Intents.GuildBans,
        Intents.GuildInvites,
        Intents.GuildMessageTyping,
        Intents.GuildScheduledEvents,
        Intents.Guilds,
        Intents.DirectMessageTyping,
        Intents.GuildEmojisAndStickers,
        Intents.GuildMembers,
        Intents.GuildMessages,
        Intents.GuildVoiceStates,
        Intents.MessageContent,
        Intents.DirectMessages,
        Intents.GuildIntegrations,
        Intents.GuildMessageReactions,
        Intents.GuildPresences,
        Intents.GuildWebhooks,
      ],
    });

    // Hook events
    const events = readdirSync(`${__dirname}/events`);
    for (const file of events) {
      const name = file.replace(".ts", "").replace(".js", "");
      const eventsFunction = await import(`./events/${file}`);

      this.client.on(name, eventsFunction.default.bind(null, this));
    }

    // Log in
    if (process.env.NODE_ENV != "ci") {
      this.client.login(this.configuration.user.token);
    }
  }
};
