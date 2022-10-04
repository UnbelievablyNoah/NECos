import { CommandInteraction, SlashCommandStringOption } from "discord.js";
import { BaseCommand } from "../../classes/BaseCommand.js";

export default class VerifyCommand extends BaseCommand {
  name = "verify";
  description =
    "Allows users to authenticate their discord accout through ROBLOX.";
  cooldown = 5;

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild()) return;

    const guild = Interaction.guild;
    const member = Interaction.member;

    const database = this.NECos.database
    const existingUser = database.select('*').from("users").where('user_id', member.id.toString());

    console.log(existingUser);

    if (existingUser) {
      await Interaction.reply({
        embeds: [
          this.Bot.createEmbed({
            title: "NECos Verification",
	    description: `It appears you are already verified with NECos (userId ${existingUser.user_id}). If you wish to re-verify to update your user information, please press continue, else, cancel.`,
	    footer: {
              text: "Prompt will automatically cancel after one minute."
            }
          })
        ]
      });
    } else {
      await Interaction.reply({
        embeds: [
          this.Bot.createEmbed({
            title: "NECos Verification",
            description: `Welcome to ${guild.name}. This server uses NECos verification as the primary utility to verify the identities of those who join the server. To begin, please send your username.`,
            footer: {
              text: "Prompt will automatically cancel after one minute."
            }
          })
        ]
      });
    }

    return [true, ""];
  };
}
