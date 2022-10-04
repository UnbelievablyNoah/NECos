import { CommandInteraction, SlashCommandStringOption } from "discord.js";
import { BaseCommand } from "../../classes/BaseCommand.js";

export default class VerifyCommand extends BaseCommand {
  Bot = null;
  NECos = null;

  name = "verify";
  description =
    "Allows users to authenticate their discord accout through ROBLOX.";

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    await Interaction.reply("HI!");

    return [false, ""];
  };
}
