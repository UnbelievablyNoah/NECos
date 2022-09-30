import type { CommandInteraction } from "discord.js";

export default class VerifyCommand {
  Bot = null;
  NECos = null;

  name = "verify";
  description =
    "Allows users to authenticate their discord accout through ROBLOX.";

  constructor(Bot) {
    this.Bot = Bot;
    this.NECos = Bot.NECos;
  }

  onCommand = async (Interaction: CommandInteraction) => {
    console.log(Interaction);
  };
}
