import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";

import { SlashCommandStringOption, SlashCommandBooleanOption } from "@discordjs/builders"
import { CommandInteraction } from "discord.js";

import Noblox, { PlayerInfo } from "noblox.js";
const { getRole } = Noblox;

export default class VerifyCommand extends BaseCommand {
  name = "bind";
  description =
    "Allows guild administrators to bind ROBLOX data to guild roles.";
  cooldown = 5;
  defaultPermission = "ADMINISTRATOR";

  constructor(Bot) {
    super(Bot);
  }

  options = [
    new SlashCommandStringOption()
      .setName("type")
      .setDescription("user OR group OR gamepass")
      .setRequired(true)
      .addChoices(
        {
          name: "user",
          value: "user"
        },

        {
          name: "group",
          value: "group"
        },

        {
          name: "gamepass",
          value: "gamepass"
        }
      ),

   new SlashCommandStringOption()
      .setName("data")
      .setDescription("userId OR GroupId:MinRank:MaxRank? OR gamepassId")
      .setRequired(true),

   new SlashCommandBooleanOption()
      .setName("default")
      .setDescription("Is the role granted to everyone?")
      .setRequired(false)
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
