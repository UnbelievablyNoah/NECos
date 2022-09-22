/**
 * @name Console.ts
 * @description NECos console output class
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

 * @param { NECos }
 */

const chalk = require("chalk");
const moment = require("moment");

module.exports = class Console {
    NECos = null;

    constructor(NECos) {
        this.NECos = NECos;
    }

    Info = function(...output: Array<string>) {
        output.forEach(function(string) {
            const Timestamp = moment().format("MM-DD HH:mm:ss")

            console.log(`${chalk.blue('[' + Timestamp + ' | INFO ]:')} ${string}`)
        })
    }

    Debug = function(...output: Array<string>) {
        if (this.NECos.Debug) {
            output.forEach(function(string) {
                const Timestamp = moment().format('MM-DD HH:mm:ss')

                return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.cyan('DEBUG')} ${chalk.blue(']:')} ${string}`)
            })
        }
    }

    Ready = function(...output: Array<string>) {
        output.forEach(function(string) {
            const Timestamp = moment().format('MM-DD HH:mm:ss')

            return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.greenBright('READY')} ${chalk.blue(']:')} ${string}`)
        })
    }

    Connection = function(...output: Array<string>) {
        output.forEach(function(string) {
            const Timestamp = moment().format('MM-DD HH:mm:ss')

            return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.greenBright('CONNECTION')} ${chalk.blue(']:')} ${string}`)
        })
    }

    Success = function(...output: Array<string>){
        output.forEach(function(string) {
            const Timestamp = moment().format('MM-DD HH:mm:ss')

            return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.green('SUCCESS')} ${chalk.blue(']:')} ${string}`)
        }) 
    }

    Error = function(...output: Array<string>){
        output.forEach(function(string) {
            const Timestamp = moment().format('MM-DD HH:mm:ss')

            return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.bgRedBright('ERROR')} ${chalk.blue(']:')} ${string}`)
        })
    }

    Critical = function(...output: Array<string>){
        output.forEach(function(string) {
            const Timestamp = moment().format('MM-DD HH:mm:ss')

            return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.bgRed('CRITICAL')} ${chalk.blue(']:')} ${string}`)
        })
    }

    Warn = function(...output: Array<string>){
        output.forEach(function(string) {
            const Timestamp = moment().format('MM-DD HH:mm:ss')

            return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.yellow('WARN')} ${chalk.blue(']:')} ${string}`)
        })
    }

    Important = function(...output: Array<string>){
        output.forEach(function(string) {
            const Timestamp = moment().format('MM-DD HH:mm:ss')

            return console.log(`${chalk.blue('[' + Timestamp + ' | ')}${chalk.red('IMPORTANT')} ${chalk.blue(']:')} ${string}`)
        })
    }
}