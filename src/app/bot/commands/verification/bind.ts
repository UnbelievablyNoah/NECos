import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { Guild, BoundRole } from "../../../Interfaces.js";

import {
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandRoleOption,
} from "@discordjs/builders";
import { CommandInteraction, PermissionFlagsBits, Colors } from "discord.js";

export default class BindCommand extends BaseCommand {
  name = "bind";
  description =
    "Allows guild administrators to bind ROBLOX data to guild roles.";
  usage =
    '/bind type:("user" OR "group" data:("userId: number" OR "groupId:minRank:maxRank?") default: boolean(true/false)';

  defaultPermission = [PermissionFlagsBits.Administrator];

  constructor(Bot) {
    super(Bot);
  }

  options = [
    new SlashCommandRoleOption()
      .setName("role")
      .setDescription("The role to bind to.")
      .setRequired(true),
    new SlashCommandStringOption()
      .setName("type")
      .setDescription("user OR group OR gamepass")
      .setRequired(true)
      .addChoices(
        {
          name: "user",
          value: "user",
        },

        {
          name: "group",
          value: "group",
        }

        /*        {
          name: "gamepass",
          value: "gamepass",
        }*/
      ),

    new SlashCommandStringOption()
      .setName("data")
      .setDescription("userId OR GroupId:MinRank:MaxRank? OR gamepassId")
      .setRequired(true),

    new SlashCommandBooleanOption()
      .setName("default")
      .setDescription("Is the role granted to everyone?")
      .setRequired(false),
  ];

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    const guild = Interaction.guild;
    const options = Interaction.options;

    const database: Knex = this.NECos.database;

    const role = options.getRole("role");
    const roleType = options.get("type", true).value.toString();
    const roleData = options.get("data", true).value.toString();
    const roleDefault = options.get("default", false);

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

    const bindData = await JSON.parse(guildData.verification_bind_data);
    const existingRole = bindData.find((r) => r.role_id == role.id.toString());

    if (existingRole) {
      const existingBind = existingRole.binds.find(
        (bind) => bind.type == roleType && bind.data == roleData
      );
      if (existingBind) {
        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              title: "Rolebind",
              description: `A role matching bind type \`${roleType}\` with data \`${roleData}\` bound to role <@&${role.id.toString()}> was already found. If you want to toggle its \`default\` status, run /setdefault.`,
              color: Colors.Red,
            }),
          ],
        });

        return [true, ""];
      }
    }

    const boundRole: BoundRole = existingRole || {
      role_id: role.id.toString(),
      binds: [],
      isDefault: (roleDefault && roleDefault.value == true) || false,
    };

    boundRole.binds.push({
      type: roleType,
      data: roleData,
    });

    if (!existingRole) bindData.push(boundRole);
    guildData.verification_bind_data = JSON.stringify(bindData);

    await guildTable.where("guild_id", guild.id.toString()).update(guildData);

    try {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            color: Colors.Green,
            title: "Rolebind",
            description: `Successfully created bind with role <@&${role.id}> to type \`${roleType}\` with data \`${roleData}\`. (isDefault: \`${boundRole.isDefault}\`)`,
          }),
        ],
      });
    } catch (error) {}

    return [true, ""];
  };
}
