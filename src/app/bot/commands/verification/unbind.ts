import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { Guild, BoundRole } from "../../../Interfaces.js";

import {
  SlashCommandStringOption,
  SlashCommandRoleOption,
} from "@discordjs/builders";
import { CommandInteraction, PermissionFlagsBits, Colors } from "discord.js";

export default class UnbindCommand extends BaseCommand {
  name = "unbind";
  description =
    "Allows guild administrators to bind ROBLOX data to guild roles.";
  usage =
    '/unbind type:("user" OR "group" data:("userId: number" OR "groupId:minRank:maxRank?")';

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
      .setRequired(false)
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
      .setRequired(false),
  ];

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    await Interaction.deferReply();

    const guild = Interaction.guild;
    const options = Interaction.options;

    const database: Knex = this.NECos.database;

    const role = options.getRole("role");
    let roleTypeOption = options.get("type");
    let roleDataOption = options.get("data");

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

    const bindData: Array<BoundRole> = await JSON.parse(
      guildData.verification_bind_data
    );
    const existingRole = bindData.find((r) => r.role_id == role.id.toString());

    if (!existingRole) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            title: "Rolebind",
            description: `No bind data was found matching <@&${role.id}>.`,
            color: Colors.Red,
          }),
        ],
      });

      return [true, ""];
    }

    if (!roleTypeOption && !roleDataOption) {
      const roleIndex = bindData.indexOf(existingRole);
      bindData.splice(roleIndex, 1);

      guildData.verification_bind_data = JSON.stringify(bindData);

      await guildTable.where("guild_id", guild.id.toString()).update(guildData);

      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            title: "Rolebind",
            description: `Successfully deleted rolebind data for <@&${role.id}> (${role.id}).`,
            color: Colors.Green,
          }),
        ],
      });

      return [true, ""];
    }

    let roleType = "";
    let roleData = "";

    if (roleTypeOption) {
      roleType = roleTypeOption.value.toString();
    }

    if (roleDataOption) {
      roleData = roleDataOption.value.toString();
    }

    const existingBinds = existingRole.binds.find(
      (bind) => bind.type == roleType || bind.data == roleData
    );
    if (!existingBinds) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            title: "Rolebind",
            description: `A role matching bind type \`${roleType}\` with data \`${roleData}\` bound to role <@&${role.id.toString()}> was not found.`,
            color: Colors.Red,
          }),
        ],
      });

      return [true, ""];
    }

    const promises = [];
    const binds = [...existingRole.binds];

    existingRole.binds.forEach((roleBind) => {
      promises.push(
        new Promise<void>((resolve) => {
          if (roleBind.type == roleType) {
            if (roleData) {
              if (roleBind.data == roleData) {
                const bindIndex = binds.indexOf(roleBind);
                binds.splice(bindIndex, 1);
              }
            } else {
              const bindIndex = binds.indexOf(roleBind);
              binds.splice(bindIndex, 1);
            }
          }

          if (roleBind.data == roleData) {
            if (roleType) {
              if (roleBind.type == roleType) {
                const bindIndex = binds.indexOf(roleBind);
                binds.splice(bindIndex, 1);
              }
            } else {
              const bindIndex = binds.indexOf(roleBind);
              binds.splice(bindIndex, 1);
            }
          }

          resolve();
        })
      );
    });

    await Promise.all(promises);
    existingRole.binds = binds;

    if (binds.length == 0) {
      const roleIndex = bindData.indexOf(existingRole);
      bindData.splice(roleIndex, 1);
    }

    guildData.verification_bind_data = JSON.stringify(bindData);

    await guildTable.where("guild_id", guild.id.toString()).update(guildData);

    let deleteString = "Task failed successfully.";

    if (roleType && roleData) {
      deleteString = `Removed all binds matching \`${roleType}\`:\`${roleData}\` on role <@&${role.id}>.`;
    } else if (roleType && !roleData) {
      deleteString = `Removed all binds matching type \`${roleType}\` on role <@&${role.id}>.`;
    } else if (roleData && !roleType) {
      deleteString = `Removed all binds matching data \`${roleData}\` on role <@&${role.id}>.`;
    }

    await Interaction.editReply({
      embeds: [
        this.Bot.createEmbed({
          title: "Rolebind",
          description: deleteString,
          color: Colors.Green,
        }),
      ],
    });

    return [true, ""];
  };
}
