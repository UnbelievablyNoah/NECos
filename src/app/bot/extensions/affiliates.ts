/**
 * @name affiliates.ts
 * @description Extends the Extension class to create an affiliates management handler.
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

import { BaseExtension } from "../classes/BaseExtension.js";
import { CommandInteraction } from "discord.js";

export default class Affiliates extends BaseExtension {
  queue = {};
  cooldowns = {};

  constructor(NECos) {
    super(NECos);

    this.up()
  }

  onUpdateInteraction = async (Interaction: CommandInteraction) => {
    if (!Interaction.inCachedGuild()) return;

    
  };

  // Loader functions
  up = async () => {
    this.Bot.commands
      .get("verification")
      .get("update")
      .on("command", this.onUpdateInteraction);
  };

  down = async () => {};
}
