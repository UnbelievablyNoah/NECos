import type { CommandInteraction, PermissionFlagsBits } from "discord.js";
import { EventEmitter } from "node:events";

export abstract class BaseCommand extends EventEmitter {
  Bot = null;
  NECos = null;

  name = "No name defined.";
  description = "No description defined.";
  usage = "No usage defined.";

  options = [];
  subCommands = [];
  defaultPermission: bigint = null;

  cooldown = null;
  developer = false;

  constructor(Bot) {
    super();

    this.Bot = Bot;
    this.NECos = Bot.NECos;
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    throw new Error("Method not implemented");
  };
}
