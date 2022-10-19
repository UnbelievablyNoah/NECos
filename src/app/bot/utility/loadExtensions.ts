/**
 * @name loadExtensions.ts
 * @description Function that loads extension files in to memory
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

import { readdir } from "fs/promises";

import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (Bot) => {
  const extensionsDir = await readdir(`${__dirname}/../extensions`);

  for (const extensionFile of extensionsDir) {
    const extensionName = extensionFile.replace(".ts", "").replace(".js", "");

    const extension = new (
      await import(`${__dirname}/../extensions/${extensionFile}`)
    ).default(Bot.NECos);
    Bot[extensionName] = extension;
  }
};
