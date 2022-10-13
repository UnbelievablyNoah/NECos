import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { Guild, User, BoundRole } from "../../../Interfaces.js";

import {
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandRoleOption,
} from "@discordjs/builders";
import { CommandInteraction, PermissionFlagsBits, Colors } from "discord.js";

import Noblox from "noblox.js";
const { getRole } = Noblox;

export default class BindCommand extends BaseCommand {
  name = "bind";
  description =
    "Allows guild administrators to bind ROBLOX data to guild roles.";
  usage =
    '/bind type:("user" OR "group" data:("userId: number" OR "groupId:minRank:maxRank?") default: boolean(true/false)';

  cooldown = 5;
  defaultPermission = [PermissionFlagsBits.ManageRoles];

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

    await Interaction.deferReply();

    const console = this.Bot.console;

    const guild = Interaction.guild;
    const member = Interaction.member;
    const channel = Interaction.channel;
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

    const existingRole = bindData.find(
      (role) =>
        role.role_id == role.id &&
        role.type == roleType &&
        role.data == roleData
    );
    if (existingRole) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            title: "Rolebind",
            description: `A role matching ${roleType} with data ${roleData} bound to role <@&existingRole.role_id> was already found. If you want to toggle its \`default\` status, run /setdefault`,
            color: Colors.Red,
          }),
        ],
      });

      return;
    }

    const boundRole: BoundRole = {
      role_id: role.id.toString(),
      type: roleType,
      data: roleData,
      isDefault: (roleDefault && roleDefault.value == true) || false,
    };

    bindData.push(boundRole);
    guildData.verification_bind_data = JSON.stringify(bindData);

    guildTable.where("guild_id", guild.id.toString()).update(guildData);

    return [true, ""];
  };
}
