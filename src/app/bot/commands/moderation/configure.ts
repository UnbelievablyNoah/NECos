import {
  CommandInteraction,
  Colors,
  SlashCommandStringOption,
  PermissionFlagsBits,
} from "discord.js";
import { Knex } from "knex";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { Guild } from "../../../Interfaces.js";

export default class ConfigureCommand extends BaseCommand {
  name = "configure";
  description =
    "Allows guild administrators to configure command permissions, channel Ids, etc.";
  usage =
    "/configure mode: string(list, set, unset), key: string(any), value: string(any)";
  defaultPermission = PermissionFlagsBits.Administrator;

  options = [
    new SlashCommandStringOption()
      .setName("mode")
      .setDescription("list | set | unset")
      .setRequired(true)
      .addChoices(
        {
          name: "list",
          value: "list",
        },
        {
          name: "set",
          value: "set",
        },
        {
          name: "unset",
          value: "unset",
        }
      ),
    new SlashCommandStringOption()
      .setName("key")
      .setDescription(
        "The key to set in the configuration. Example: channels.auditLog OR permissions.<commandName>"
      )
      .setRequired(false),
    new SlashCommandStringOption()
      .setName("value")
      .setDescription("The new value of the key")
      .setRequired(false),
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
    const key = options.getString("key");
    const value = options.getString("value");

    const guildConfigString = await database<Guild>("guilds")
      .select("configuration")
      .where("guild_id", guild.id)
      .first();

    const guildConfig = JSON.parse(guildConfigString.configuration);

    switch (mode) {
      case "list":
        let listString = "";

        function parseStringFromConfig(config) {
          let listString = "";

          for (const index in config) {
            const value = config[index];

            if (typeof value == "object") {
              listString += `**${index}**:\n`;
              listString += parseStringFromConfig(value);
            } else {
              listString += `• ${index}: ${value}\n`;
            }
          }

          return listString;
        }

        listString = parseStringFromConfig(guildConfig);

        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              color: Colors.Orange,
              title: "Guild Configuration",
              description: `Current guild configuration for ${guild.name}:\n${listString}`,
            }),
          ],
        });
        break;
      case "set":
        if (!key || !value) return [false, "Missing key or value argument"];

        var indexes = key.split(".") || [key];
        let foundValue = guildConfig;

        console.log(foundValue);

        for (let i = 0; i < indexes.length - 1; i++) {
          const index = indexes[i];

          if (!foundValue[index]) {
            foundValue[index] = {};
          }

          foundValue = foundValue[index];
        }

        foundValue = foundValue[indexes[indexes.length - 1]];

        if (foundValue != null && typeof value != typeof foundValue)
          return [
            false,
            `Value of ${key} much match its current type. (${typeof value})`,
          ];

        var containingObject = guildConfig;
        for (let i = 0; i < indexes.length - 1; i++) {
          containingObject = containingObject[indexes[i]];
        }

        let parsedJSON = undefined;
        try {
          parsedJSON = await JSON.parse(value);
        } catch (error) {}

        containingObject[indexes[indexes.length - 1]] = parsedJSON || value;

        try {
          await database<Guild>("guilds")
            .update("configuration", JSON.stringify(guildConfig))
            .where("guild_id", guild.id);

          await Interaction.editReply({
            embeds: [
              this.Bot.createEmbed({
                color: Colors.Green,
                title: "Guild Configuration Updated",
                description: `${key} has been set to ${value}.`,
              }),
            ],
          });
        } catch (error) {
          await Interaction.editReply({
            embeds: [
              this.Bot.createEmbed({
                color: Colors.Red,
                title: "Guild Configuration Update Unsuccessful",
                description: `Guild configuration failed to update. ${error}.`,
              }),
            ],
          });
        }

        break;
      case "unset":
        if (!key) return [false, "Missing key or value argument"];

        var indexes = key.split(".") || [key];

        var containingObject = guildConfig;
        for (let i = 0; i < indexes.length - 1; i++) {
          containingObject = containingObject[indexes[i]];
        }

        const valueType = typeof containingObject[indexes[indexes.length - 1]];
        const defaultValues = {
          string: "-1",
          number: -1,
          object: {},
        };

        containingObject[indexes[indexes.length - 1]] =
          defaultValues[valueType];

        try {
          await database<Guild>("guilds")
            .update("configuration", JSON.stringify(guildConfig))
            .where("guild_id", guild.id);

          await Interaction.editReply({
            embeds: [
              this.Bot.createEmbed({
                color: Colors.Green,
                title: "Guild Configuration Updated",
                description: `${key} has been set to default.`,
              }),
            ],
          });
        } catch (error) {
          await Interaction.editReply({
            embeds: [
              this.Bot.createEmbed({
                color: Colors.Red,
                title: "Guild Configuration Update Unsuccessful",
                description: `Guild configuration failed to update. ${error}.`,
              }),
            ],
          });
        }

        break;
      default:
        return [false, "Invalid mode entered"];
    }

    return [true, ""];
  };
}
