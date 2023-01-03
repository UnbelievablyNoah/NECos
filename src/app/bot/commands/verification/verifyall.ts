import { CommandInteraction, Colors, PermissionFlagsBits } from "discord.js";
import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { User, Guild } from "../../../Interfaces.js";

export default class UpdateCommand extends BaseCommand {
  name = "verifyall";
  description =
    "Allows guild administrators to reverify all members of a guild.";
  usage = "/verifyall";
  defaultPermission = PermissionFlagsBits.Administrator;

  cooldown = 15;

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    const guild = Interaction.guild;
    const channel = Interaction.channel;
    const database: Knex = this.NECos.database;

    const guildData = await database<Guild>("guilds")
      .select("*")
      .where("guild_id", guild.id.toString())
      .first();
    if (!guildData) {
      await channel.send({
        embeds: [
          this.Bot.createEmbed({
            color: Colors.Red,
            title: "User Update",
            description: `User update failed to due guild data being empty (for guild_id ${guild.id}).`,
          }),
        ],
      });

      return [true, ""]
    }

    const guildMembers = await guild.members.list({limit: 1000})

    await Interaction.editReply({
      embeds: [
        this.Bot.createEmbed({
          color: Colors.Orange,
          title: "Verify All",
          description: `Updating all guild members. This may take some time.`,
        }),
      ],
    })

    for (const member of Array.from(guildMembers.values())) {
      const user = await database<User>("users")
        .select("*")
        .where("user_id", member.id.toString())
        .first();
      if (!user) continue;

      const errors = await this.Bot.updateUser(member, guild, guildData, user);

      let errorString = "";
      if (errors.length > 0) {
        errorString = `\nErrors: ${errors.join("\n")}`;
      }

      await channel.send({
        embeds: [
          this.Bot.createEmbed({
            color: (errors.length > 0 && Colors.Orange) || Colors.Green,
            title: "User Update",
            description: `Update for <@${member.id}> successful. ${errorString}`,
          }),
        ],
      })

      await new Promise((resolve) => {
        setTimeout(resolve, 5_000)
      })
    }

    return [true, ""];
  };
}
