/**
 * @name Bot.ts
 * @description NECos discord bot class
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

const { Collection, Client, GatewayIntentBits: Intents } = require("discord.js")

module.exports = class Bot {
    NECos = null
    console = null
    configuration = null
    client = null

    // Declare utility functions
    generatePresence = null

    constructor(NECos) {
        const FileSystem = require("fs")

        this.NECos = NECos
        this.console = NECos.console
        this.configuration = NECos.configuration.bot

        // Load utility functions
        const utilities = FileSystem.readdirSync(`${__dirname}/utility`)
        utilities.forEach(file => {
            const name = file.replace('.ts', '').replace('.js', '')
            const utilFunction = require(`./utility/${file}`)

            this[name] = utilFunction.bind(null, this);
        })

        // Create client
        this.client = new Client({
            presence: {
                status: "idle",
                activities: [
                    {
                        name: "Starting up...",
                        type: 1
                    }
                ]
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
                Intents.GuildWebhooks
            ]
        })

        // Hook events
        const events = FileSystem.readdirSync(`${__dirname}/events`)
        events.forEach(file => {
            const name = file.replace('.ts', '').replace('.js', '')
            const eventsFunction = require(`./events/${file}`)

            this.client.on(name, eventsFunction.bind(null, this))
        })

        // Log in
        if (process.env.NODE_ENV != "ci") {
            this.client.login(this.configuration.user.token)
        }
    }
}