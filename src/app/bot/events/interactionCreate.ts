/**
 * @name interactionCreate.ts
 * @description Function bound on bot start which handles whenever an interaction (of any type) is created against the API
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

 * @param { typeof Bot }
 * @param { typeof BaseInteraction }
 */

import { Collection, BaseInteraction } from 'discord.js';

const cooldownData: Collection<string, Collection<string, Array<string>>> = new Collection();

export default async (Bot, Interaction: BaseInteraction) => {
  if (!Interaction.inCachedGuild()) return;
  const member = Interaction.member;

  if (Interaction.isCommand()) { // Handle command interactons
    const commands: Collection<string, Collection<string, any>> = Bot.commands;
    const command = commands.find(category => category.find(command => command.name == Interaction.commandName)).first();

    // check cooldown
    if (command.cooldown && !member.permissions.has("ManageMessages")) {
      if (!cooldownData.has(command.name)) {
        cooldownData.set(command.name, new Collection())
      }

      const commandCooldownData = cooldownData.get(command.name)
      const cooldownTime = commandCooldownData.get(member.id);

      if (cooldownTime !== null) {
        
      } else {

      }
    }

    
  }
};
