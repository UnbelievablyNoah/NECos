/**
 * @name Bot.ts
 * @description NECos discord bot class
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

 * @param { typeof NECos }
 */

// Declare dirname
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  Collection,
  Client,
  GatewayIntentBits as Intents,
  GuildMember,
  Colors,
  PermissionFlagsBits
} from "discord.js";
import { readdirSync } from "fs";
import { CachedUserData } from "../Interfaces.js";
import { BaseCommand } from "./classes/BaseCommand.js";
import { Knex } from "knex";


export class Bot {
  NECos = null;
  console = null;
  configuration = null;
  client: Client = null;
  commands: Collection<string, Collection<string, BaseCommand>> = null;
  userCache: Array<CachedUserData> = [];

  // Declare utility functions
  loadCommands = null;
  loadExtensions = null;
  createEmbed = null;
  updateUser = null;

  // Declare extensions
  auditLogs = null;
  affiliates = null;
  music = null;

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
    if (process.env.NODE_ENV == "ci") {
      this.loadCommands(false); // Test commands
      this.loadExtensions(); // Test extensions
    } else {
      this.client.login(this.configuration.user.token);
    }
  };

  cacheUser = (member: GuildMember, userData: CachedUserData) => {
    this.userCache[member.id.toString()] = userData;

    setTimeout(() => {
      delete this.userCache[member.id.toString()];
    }, 60_000 * 5);
  };

  deleteUserData = async (member: GuildMember): Promise<void> => {
    const guilds = this.client.guilds.cache;
    const database: Knex = this.NECos.database;

    // Delete user
    await database("users").delete("*").where("user_id", member.id)

    for (const guild of Array.from(guilds.values())) {
      const guildMember = await guild.members.resolve(member.id)

      if (!guildMember) continue;

      // Strip user of roles
      const errors = [];
      for (const role of guildMember.roles.cache) {
        try {
          await guildMember.roles.remove(role);
        } catch (error) {
          errors.push(error)
        }
      }
      
      if (errors.length == 0) {
        errors.push("None.")
      }

      // Send notification that the user has been deleted
      let notificationSent = false;

      const embedData = {
        color: Colors.DarkRed,
        title: "Userdata Deletion",
        description: `A user matching id ${member.id} has processed a full deletion of their userdata, and has been stripped of all roles in this server.\nErrors:${errors.join("\n")}`,
      }

      try {
        notificationSent = await new Promise<boolean>(async (resolve, reject) => {
          try {
            await this.auditLogs.push(guild, embedData);
  
            resolve(true);
          } catch (error) {}
  
          try {
            const guildOwner = await guild.fetchOwner();
  
            try {
              await guildOwner.send(this.createEmbed(embedData))
  
              resolve(true);
            } catch (error) {}
          } catch (error) {}
  
          const guildMembers = await (await guild.members.list({limit: 1000})).filter(member => member.permissions.has(PermissionFlagsBits.Administrator));
          let sent = false;
          for (const guildMember of Array.from(guildMembers.values())) {
            try {
              await guildMember.send(this.createEmbed(embedData))
  
              sent = true;
            } catch (error) {}
          }

          if (sent) {
            resolve(true);
          }
  
          reject("Failed to send member deletion signal to ANY channel or guild administrator.");
        })
      } catch (error) {
        this.console.error(error)
      }
    }
  };
}
