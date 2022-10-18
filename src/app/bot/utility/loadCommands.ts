/**
 * @name loadCommands.ts
 * @description Function that loads commands for the bot to use, optionally posting them to the Discord API.
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
 * @param pushToRest: boolean
 */

import { readdir } from "fs/promises";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST, Routes, Collection } from "discord.js";

import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (Bot, pushToRest: boolean) => {
  const console = Bot.console;
  const commandsDir = await readdir(`${__dirname}/../commands`);
  const commands = new Collection();
  const commandJSON = [];

  console.debug("Reading commands directory...");

  for (const directory of commandsDir) {
    const categoryArray = new Collection();
    const categoryDir = await readdir(`${__dirname}/../commands/${directory}`);

    console.debug(`Reading category ${directory}...`);

    for (const file of categoryDir) {
      console.debug(`Loading command ${file} of category ${directory}...`);
      if (categoryArray.has(file)) {
        console.warn(
          `Command Category ${directory} already contains a key matching ${file}. Verify you have no duplicate commands`
        );

        continue;
      }

      console.debug("Constructing command...");

      const command = new (
        await import(`${__dirname}/../commands/${directory}/${file}`)
      ).default(Bot);
      categoryArray.set(command.name, command);

      // Create slashCommand
      const SlashCommand = new SlashCommandBuilder();
      SlashCommand.setName(command.name);
      SlashCommand.setDescription(command.description);
      
      for (const defaultPermission of command.defaultPermissions || []) {
        SlashCommand.setDefaultMemberPermissions(defaultPermission);
      }

      for (const option of command.options || []) {
        SlashCommand.options.push(option);
      }
      commandJSON.push(SlashCommand.toJSON());

      console.debug("Command constructed!");
    }

    commands.set(directory, categoryArray);
  }

  if (pushToRest) {
    try {
      console.debug("Spawning Discord REST API");
      const API = new REST({ version: "10" }).setToken(
        Bot.configuration.user.token
      );

      console.debug("Pushing SlashCommands to Discord REST.");
      await API.put(Routes.applicationCommands(Bot.client.user.id), {
        body: commandJSON,
      });

      console.success("Successfully pushed SlashCommands to Discord REST API");
    } catch (error) {
      console.error(`Failed to push SlashCommands to Discord API! ${error}`);
    }
  }

  Bot.commands = commands;
};
