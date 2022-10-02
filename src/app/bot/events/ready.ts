/**
 * @name ready.ts
 * @description Function bound on bot start which handles sending initial data to the discord API on client ready.
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

export default async (Bot) => {
  // Load commands (try-catches are handled in the function)
  await Bot.loadCommands();

  // Start presence thread
  async function setPresence() {
    const presence = {
      status: "online",
      activities: [
        {
          name: "necos.dev | /help",
          type: 0
        }
      ]
    }

    try {
      Bot.client.user.setPresence(presence);
    } catch (error) {
      Bot.console.error(error);
    }
  }

  setPresence();
  setInterval(setPresence, Bot.configuration.user.presence_update_interval);
};
