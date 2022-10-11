import type { CommandInteraction } from "discord.js";

export abstract class BaseCommand {
  Bot = null;
  NECos = null;

  name = "No name defined.";
  description = "No description defined.";
  usage = "No usage defined.";

  options = [];
  defaultPermissions = [];

  constructor(Bot) {
    this.Bot = Bot;
    this.NECos = Bot.NECos;
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    throw new Error("Method not implemented");
  };
}
