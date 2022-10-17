import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { Guild, BoundRole } from "../../../Interfaces.js";

import {
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandRoleOption,
} from "@discordjs/builders";
import { CommandInteraction, PermissionFlagsBits, Colors } from "discord.js";

export default class BindsCommand extends BaseCommand {
  name = "binds";
  description =
    "Allows guild administrators to list rolebinds for this guild.";
  usage =
    '/binds';

  defaultPermission = [PermissionFlagsBits.Administrator];

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    const guild = Interaction.guild;
    const database: Knex = this.NECos.database;
   
    const guildTable = database<Guild>("guilds");
    let guildData = await guildTable
      .select("*")
      .where("guild_id", guild.id.toString())
      .first();

    if (!guildData) {
      guildData = await guildTable.insert({
        guild_id: guild.id,
      });
    }

    const bindData: Array<BoundRole> = await JSON.parse(guildData.verification_bind_data);
    const fields = [];
    
    for (const boundRole of bindData) {
      let bindString = "\n";
      for (const bindData of boundRole.binds) {
        bindString += ` • \`${bindData.type}\`:\`${bindData.data}\`\n`
      }

      fields.push(`<@&${boundRole.role_id}> (isDefault \`${boundRole.isDefault}\`): ${bindString}`)
    }

    await Interaction.reply({
      embeds: [
        this.Bot.createEmbed({
          title: "Rolebinds",
          description: `List of rolebinds for **${guild.name}**:\n${fields.join("\n")}`,
          color: Colors.Green
        })
      ]
    })

    return [true, ""];
  };
}
