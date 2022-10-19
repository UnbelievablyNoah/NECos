/**
 * @name Configuration.ts
 * @description NECos configuration class
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

 * @param { fileName: string }
 */

import { parse as parseTOML } from "toml";
import { readFileSync } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Configuration {
  fileName = "";
  configuration = null;

  constructor(fileName: string) {
    this.fileName = fileName;

    try {
      // Attempt to read the configuration file from the specified path
      const configString = readFileSync(`${__dirname}/../../../${this.fileName}`).toString();

      // Parse the toml or json data
      const fileExtension = fileName.split(".").pop();
      switch (fileExtension) {
        case "toml":
          this.configuration = parseTOML(configString);
          break;
        case "json":
          this.configuration = JSON.parse(configString);
          break;
        default:
          throw new Error(
            `InvalidFileExtensionException occured on ${this.fileName}. Please ensure the fileName is typed correctly.`
          );
          break;
      }
    } catch (error) {
      throw new Error(
        `ParseException: configString failed to parse. Verify the syntax of ${this.fileName} and that the file exists.`
      );
    }
  }
}
