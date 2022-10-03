import { CommandInteraction, SlashCommandStringOption } from "discord.js";
import { BaseCommand } from "../../classes/BaseCommand.js";

export default class VerifyCommand extends BaseCommand {
  Bot = null;
  NECos = null;

  name = "verify";
  description =
    "Allows users to authenticate their discord accout through ROBLOX.";
  cooldown = 10;

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (Bot, Interaction: CommandInteraction): Promise<[boolean, string]> {
    await Interaction.reply("HI!")

    return [false, "balls"];
  };
}
