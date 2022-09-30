/**
 * @name loadCommands.ts
 * @description Function that generates presence data
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

import { readdir } from "fs/promises";
import { Collection } from "@discordjs/collection";

export default async (Bot) => {
  const commandsDir = await readdir("./src/app/bot/commands");
  const commands = new Collection();

  for (const directory of commandsDir) {
    const categoryArray = new Collection();
    const categoryDir = await readdir(`./src/app/bot/commands/${directory}`);

    for (const file of categoryDir) {
      if (categoryArray.has(file)) {
        console.warn(
          `Command Category ${directory} already contains a key matching ${file}. Verify you have no duplicate commands`
        );

        continue;
      }

      const command = new (
        await import(`../commands/${directory}/${file}`)
      ).default(Bot);
      categoryArray.set(command.name, command);
    }

    commands.set(directory, categoryArray);
  }

  Bot.commands = commands;
};
