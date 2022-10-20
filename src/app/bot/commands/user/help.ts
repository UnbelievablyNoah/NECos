import {
  CommandInteraction,
  Colors,
  ActionRowBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  Collection,
  ComponentType,
} from "discord.js";
import { BaseCommand } from "../../classes/BaseCommand.js";

const firstToUpper = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default class HelpCommand extends BaseCommand {
  name = "help";
  description =
    "Allows users to view a list of commands & general bot information.";
  usage = "/help";

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    const member = Interaction.member;
    const commands: Collection<string, Collection<string, BaseCommand>> = this
      .Bot.commands;
    const options = [
      new SelectMenuOptionBuilder()
        .setLabel("Information")
        .setValue("information")
        .setDescription("The main information page."),
    ];

    for (const key of Array.from(commands.keys())) {
      options.push(
        new SelectMenuOptionBuilder()
          .setLabel(firstToUpper(key))
          .setValue(key)
          .setDescription(`All commands in the ${firstToUpper(key)} category.`)
      );

      /*
      options.push({
        label: firstToUpper(key),
        value: key,
        description: `All commands relating to ${firstToUpper(key)}.`
      })*/
    }

    const defaultEmbed = this.Bot.createEmbed({
      color: Colors.Green,
      title: "NECos Help Menu",
      description: `Welcome to NECos, the open-source easy-to-use data management application & remote community moderation endpoint. Use the dropdown below to view a list of commands.`,
      fields: [
        {
          name: "NECos Version (commitId)",
          value: `${this.NECos.version}`,
          inline: true,
        },

        {
          name: "NECos GitHub",
          value: "https://github.com/Nuclear-Engineering-Co/NECos",
          inline: true,
        },
      ],
    });

    await Interaction.editReply({
      embeds: [defaultEmbed],
      components: [
        new ActionRowBuilder<SelectMenuBuilder>().addComponents(
          new SelectMenuBuilder()
            .setCustomId("categorySelect")
            .setPlaceholder("Information")
            .addOptions(...[options])
        ),
      ],
    });

    const interactionReply = await Interaction.fetchReply();

    const interactionCollector =
      interactionReply.createMessageComponentCollector({
        filter: (interaction) => interaction.member.id === member.id,
        idle: 120_000,
        componentType: ComponentType.SelectMenu,
      });

    let activePanel = "information";
    interactionCollector.on("collect", async (collected) => {
      try {
        await collected.deferUpdate();
      } catch (error) {}

      const panelName = collected.values[0];
      if (panelName == activePanel) return;
      activePanel = panelName;

      if (panelName == "information") {
        await Interaction.editReply({
          embeds: [defaultEmbed],
        });
      } else {
        const commandCategory = commands.get(panelName);
        const fields = [];

        for (const commandName of Array.from(commandCategory.keys())) {
          const command = commandCategory.get(commandName);

          fields.push({
            name: firstToUpper(commandName),
            value: `• Description: ${command.description}\n• Usage: ${command.usage}`,
          });
        }

        const commandPanelEmbed = this.Bot.createEmbed({
          color: Colors.Green,
          title: `${firstToUpper(panelName)} Commands`,
          fields: fields,
        });

        await Interaction.editReply({
          embeds: [commandPanelEmbed],
        });
      }
    });

    interactionCollector.on("end", async () => {
      try {
        await interactionReply.delete();
      } catch (error) {}
    });

    return [true, ""];
  };
}
