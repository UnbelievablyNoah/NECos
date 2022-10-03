import type { CommandInteraction } from "discord.js"

export abstract class BaseCommand {
    Bot = null
    NECos = null

    name = ""
    description = ""
    options = []
    defaultPermissions = []

    constructor(Bot) {
        this.Bot = Bot;
        this.NECos = Bot.NECos;
    }

    onCommand = async function (Bot, Interaction: CommandInteraction) : Promise<[boolean, string]> {
        throw new Error("Method not implemented")
    }
}