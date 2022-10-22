import {
  CommandInteraction,
  Colors,
  SlashCommandStringOption,
  PermissionFlagsBits,
} from "discord.js";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { inspect } from "util";

export default class EvalCommand extends BaseCommand {
  name = "eval";
  description =
    "Allows bot developers to execute raw JavaScript code.";
  usage =
    "/eval code: string";
  
  developer = true;

  options = [
    new SlashCommandStringOption()
      .setName("code")
      .setDescription("The code to run.")
      .setRequired(true)
  ];

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    const code = Interaction.options.getString("code", true);
    const Bot = this.Bot;

    async function cleanString(string) {
      if (string && string.constructor && string.constructor.name == "Promise") string = await string;
      if (typeof string !== "string")
        string = inspect(string, { depth: 1 });

      string = string
        .replace(
          Bot.client.token,
          "[Content Removed for Security Reasons.]"
        )
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
      return string;
    }

    try {
      const evaled = eval(code);
      let clean = await cleanString(evaled);
      await Interaction.editReply({
        content: `\`Success!\``,
        files: [
          {
            attachment: Buffer.from(clean),
            name: "results.js",
          },
        ],
      });
    } catch (error) {
      await Interaction.editReply({
        content: `\`Error!\``,
        files: [
          {
            attachment: Buffer.from(await cleanString(error)),
            name: "results.js",
          },
        ],
      });
    }
    
    return [true, ""];
  };
}
