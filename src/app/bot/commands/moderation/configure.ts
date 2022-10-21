import {
  CommandInteraction,
  Colors,
  SlashCommandStringOption,
  PermissionFlagsBits,
} from "discord.js";
import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { Guild } from "../../../Interfaces.js";

export default class WhoisCommand extends BaseCommand {
  name = "configure";
  description =
    "Allows guild administrators to configure command permissions, channel Ids, etc.";
  usage = "/configure mode: string(list, set, unset), key: string(any), value: string(any)";
  defaultPermission = PermissionFlagsBits.Administrator;

  options = [
    new SlashCommandStringOption()
      .setName("mode")
      .setDescription("list | set | unset")
      .setRequired(true)
      .addChoices(
        {
          name: "list",
          value: "list"
        },
        {
          name: "set",
          value: "set"
        },
        {
          name: "unset",
          value: "unset"
        }
      ),
    new SlashCommandStringOption()
      .setName("key")
      .setDescription("The key to set in the configuration. Example: channels.auditLog OR permissions.<commandName>")
      .setRequired(true),
    new SlashCommandStringOption()
      .setName("value")
      .setDescription("The new value of the key")
      .setRequired(false)
  ];

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    const database: Knex = this.NECos.database;
    const guild = Interaction.guild;
    const options = Interaction.options;

    const mode = options.getString("mode", true);
    const key = options.getString("key", true);
    const value = options.getString("value");

    const guildConfigString = await database<Guild>("guilds")
      .select("configuration")
      .where("guild_id", guild.id)
      .first();

    const guildConfig = JSON.parse(guildConfigString.configuration);

    console.log(guildConfig);

    switch (mode) {
      case "list":
        
        break;
      case "set":
        break;
      case "unset":
        break;
      default:
        return [false, "Invalid mode entered."]
    }

    return [true, ""];
  };
}
