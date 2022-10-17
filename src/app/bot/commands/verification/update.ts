import { CommandInteraction, Colors } from "discord.js";
import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { User, Guild, CachedUserData } from "../../../Interfaces.js";

import Noblox from "noblox.js";
const { getRankInGroup } = Noblox;

export default class UpdateCommand extends BaseCommand {
  name = "update";
  description =
    "Allows users to re-obtain roles, and reset their nickname based on the guild's ROBLOX bind data.";
  usage =
    '/update';

  cooldown = 15;

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    await Interaction.deferReply();

    const guild = Interaction.guild;
    const member = Interaction.member;

    const database: Knex = this.NECos.database;

    const user = await database<User>("users").select("*").where("user_id", member.id.toString()).first();
    if (!user) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            color: Colors.Red,
            title: "User Update",
            description: "You must be verified with NECos before running /update."
          })
        ]
      });

      return [true, ""];
    }

    const guildData = await database<Guild>("guilds").select("*").where("guild_id", guild.id.toString()).first();;
    if (!guildData) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            color: Colors.Red,
            title: "User Update",
            description: `User update failed to due guild data being empty (for guild_id ${guild.id}). Contact a guild administrator.`
          })
        ]
      });

      return [true, ""];
    }

    const bindData = JSON.parse(guildData.verification_bind_data);
    let userData: CachedUserData = this.Bot.userCache[member.id.toString()] || {
      groups: {},
      ownedAssets: [],
    }

    const errors = [];

    for (const boundRole of bindData) {
      const binds = boundRole.binds;
      const isDefault = boundRole.isDefault;
      let canGetRole = false;

      if (isDefault) {
        canGetRole = true;
        break;
      } else {
        for (const roleBind of binds) {
          const roleType = roleBind.type;
          const roleData = roleBind.data;

          switch (roleType) {
            case "user":
              if (user.roblox_id.toString() == roleData) {
                canGetRole = true;
              }
              break;
            case "group":
              const groupDataComponents = roleData.split(":");

              const groupId = groupDataComponents[0];
              const minRank = groupDataComponents[1];
              const maxRank = groupDataComponents[2];

              let groupRank = userData.groups[groupId];
              if (!groupRank) {
                try {
                  groupRank = await getRankInGroup(parseInt(groupId), user.roblox_id);
                  userData.groups[groupId] = groupRank;
                } catch (error) {
                  groupRank = 0;

                  errors.push(error);
                }

                this.Bot.cacheUser(member, userData);
              }

              if (!minRank && groupRank > 0) {
                canGetRole = true;
                break;
              }

              if (groupRank >= (minRank || 1) && groupRank <= (maxRank || 255)) {
                canGetRole = true;
                break;
              }

              break;
          }
        }
      }

      if (canGetRole) {
        const role = await guild.roles.resolve(boundRole.role_id);
        if (role) {
          try {
            await member.roles.add(role);
          } catch (error) {
            errors.push(`Error applying role: ${error}`);
          }
        } else {
          errors.push(`A role matching ${boundRole.role_id} was not found.`);
        }
      } else {
        const role = await member.roles.resolve(boundRole.role_id);
        if (role) {
          try {
            await member.roles.remove(role);
          } catch (error) {
            errors.push(`Error removing role: ${error}`)
          }
        }
      }
    }

    let errorString = "";
    if (errors.length > 0) {
      errorString = `Errors: ${errors.join(" ")}`
    }

    await Interaction.editReply({
      embeds: [
        this.Bot.createEmbed({
          color: (errors.length > 0 && Colors.Orange) || Colors.Green,
          title: "User Update",
          description: `Update for <@${member.id}> successful. ${errorString}`
        })
      ]
    })

    return [true, ""];
  };
}
