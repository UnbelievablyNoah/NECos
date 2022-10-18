import { CommandInteraction, Colors, SlashCommandUserOption, SlashCommandStringOption, PermissionFlagsBits, Role } from "discord.js";
import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { User, Guild, CachedUserData } from "../../../Interfaces.js";

import Noblox, { PlayerInfo } from "noblox.js";
const { getPlayerInfo } = Noblox;

export default class WhoisCommand extends BaseCommand {
  name = "whois";
  description =
    "Allows users to re-obtain roles, and reset their nickname based on the guild's ROBLOX bind data.";
  usage = "/whois @user OR roblox id OR discord id";
  defaultPermissions = [PermissionFlagsBits.ModerateMembers]

  options = [
    new SlashCommandUserOption()
      .setName("user")
      .setDescription("The guild member to search for")
      .setRequired(false),
    new SlashCommandStringOption()
      .setName("string")
      .setDescription("The roblox id or discord id to search for")
      .setRequired(false)
  ]

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
    const options = Interaction.options;

    const userOption = options.getUser("user", false);
    const stringOption = options.getString("string", false); 

    if (!userOption && !stringOption) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            title: "Whois",
            description: `You must provide a user or string argument to search for a user.`,
            color: Colors.Red
          })
        ]
      })

      return [true, ""]
    }

    const database: Knex = this.NECos.database;
    let user: User = null;

    if (userOption) {
      user = await database<User>("users")
        .select("*")
        .where("user_id", userOption.id)
        .first();
    } else {
      user = await database<User>("users")
        .select("*")
        .where("user_id", stringOption.toString())
        .or.where("roblox_id", stringOption.toString())
        .first();
    }

    if (!user) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            color: Colors.Red,
            title: "Whois",
            description: "No user was found for the entered query."
          })
        ]
      })

      return [true, ""]
    }

    const guildMember = await guild.members.resolve(user.user_id);
    if (!guildMember) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            color: Colors.Red,
            title: "Whois",
            description: "No user was found for the entered query."
          })
        ]
      })

      return [true, ""]
    }

    let playerInfo: PlayerInfo = null;

    try {
      playerInfo = await getPlayerInfo(user.roblox_id)
    } catch (error) {
      await Interaction.editReply({
        embeds: [
          this.Bot.createEmbed({
            color: Colors.Red,
            title: "Whois",
            description: `Failed to get player info from Roblox API. Error: ${error}.`
          })
        ]
      })

      return [true, ""]
    }

    const roles = guildMember.roles.cache;
    let roleArray = [];

    const roleKeys = Array.from(roles.keys());
    for (const key of roleKeys) {
      const role: Role = roles.get(key);

      roleArray.push(`<@&${role.id}>`)
    }

    await Interaction.editReply({
      embeds: [
        this.Bot.createEmbed({
          color: Colors.Green,
          title: "Whois",
          description: `User info for ${playerInfo.displayName} (@${playerInfo.username}):`,
          thumbnail: {
            url: guildMember.user.avatarURL()
          },
          fields: [
            {
              name: "Discord User",
              value: `<@${user.user_id}> (${user.user_id})`,
              inline: true
            },
            {
              name: "Joined Server",
              value: `${guildMember.joinedAt}`,
              inline: true,
            },
            {
              name: "Verified At",
              value: `${user.created_at}`,
              inline: true
            },
            {
              name: "Roblox Id",
              value: `${user.roblox_id}`,
              inline: true,
            },
            {
              name: "Roblox Username",
              value: `${playerInfo.username}`,
              inline: true
            },
            {
              name: "Roblox Display Name",
              value: `${playerInfo.displayName}`,
              inline: true
            },
            {
              name: "Roblox Join Date",
              value: `${playerInfo.joinDate}`,
              inline: true
            },
            {
              name: "Roles",
              value: roleArray.join(",")
            }
          ]
        }),
      ],
    });

    return [true, ""];
  };
}
