/**
 * @name Console.ts
 * @description NECos console output class
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

import chalk from "chalk";
export class Console {
  NECos = null;

  constructor(NECos) {
    this.NECos = NECos;
  }

  getTimestamp = function () {
    const dateObject = new Date();
    const date = `0${dateObject.getDate()}`.slice(-2);

    // current month
    const month = `0${dateObject.getMonth() + 1}`.slice(-2);

    // current hours
    const hours = dateObject.getHours();

    // current minutes
    const minutes = dateObject.getMinutes();

    // current seconds
    const seconds = dateObject.getSeconds();

    return `${month}-${date} ${hours}:${minutes}:${seconds}`;
  };

  info = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | INFO ]:")} ${string}`
      );
    }
  };

  debug = function (...output: Array<string>) {
    if (this.NECos.debug) {
      for (const string of output) {
        console.log(
          `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.cyan(
            "DEBUG"
          )} ${chalk.blue("]:")} ${string}`
        );
      }
    }
  };

  ready = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.greenBright(
          "READY"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };

  starting = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.magenta(
          "STARTING"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };

  connection = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.greenBright(
          "CONNECTION"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };

  success = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.green(
          "SUCCESS"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };

  error = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.bgRedBright(
          "ERROR"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };

  critical = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.bgRed(
          "CRITICAL"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };

  warn = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.yellow(
          "WARN"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };

  important = function (...output: Array<string>) {
    for (const string of output) {
      console.log(
        `${chalk.blue("[" + this.getTimestamp() + " | ")}${chalk.red(
          "IMPORTANT"
        )} ${chalk.blue("]:")} ${string}`
      );
    }
  };
}
