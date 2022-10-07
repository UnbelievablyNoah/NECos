import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { SlashCommandStringOption } from "@discordjs/builders"

import Noblox, { PlayerInfo } from "noblox.js";
const { getRole } = Noblox;

export default class VerifyCommand extends BaseCommand {
  name = "verify";
  description =
    "Allows users to authenticate their discord accout through ROBLOX.";
  cooldown = 5;

  constructor(Bot) {
    super(Bot);
  }

  options: [
    new SlashCommandStringOption()
      .setName("type")
      .setDescription("user OR group OR gamepass")
      .setRequired(true)
      .setChoices("user", "group", "gamepass")
  ]

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild()) return;

    // const console = this.Bot.console;

    const guild = Interaction.guild;
    const member = Interaction.member;
    const channel = Interaction.channel;

    const database: Knex = this.NECos.database;
    


    return [true, ""];
  };
}
