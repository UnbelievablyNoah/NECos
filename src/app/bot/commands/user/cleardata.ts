import {
  CommandInteraction,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import { BaseCommand } from "../../classes/BaseCommand.js";
import { Knex } from "knex";

export default class ClearDataCommand extends BaseCommand {
  name = "cleardata";
  description = "Allows users request a purge of all of their data from NECos.";
  usage = "/cleardata";

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild() || !Interaction.isChatInputCommand())
      return;

    const member = Interaction.member;
    const database: Knex = this.NECos.database;

    await Interaction.editReply({
      embeds: [
        this.Bot.createEmbed({
          color: Colors.DarkRed,
          title: "Userdata Purge",
          description:
            "Are you **sure** you want to clear all of your NECos data? This will **permanently** delete all of your information from our database, and will unverify you in all servers you're verified in.\n**This CANNOT be undone.**\nA notification will be sent to guild administrators advising of the data deletion. (Only your Discord User Id will be sent.)",
          footer: {
            text: "Prompt will time out in 30 seconds.",
          },
        }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Delete my data")
            .setStyle(ButtonStyle.Danger)
            .setCustomId("true"),
          new ButtonBuilder()
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("false")
        ),
      ],
    });

    const interactionReply = await Interaction.fetchReply();

    const interactionCollector =
      interactionReply.createMessageComponentCollector({
        filter: (interaction) => interaction.member.id === member.id,
        time: 30_000,
        componentType: ComponentType.Button,
        maxComponents: 1,
      });

    interactionCollector.on("collect", async (collected) => {
      try {
        await collected.deferUpdate();
      } catch (error) {}

      const deleteData = collected.customId === "true";

      if (deleteData) {
        await this.Bot.deleteUserData(member);
        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              color: Colors.DarkRed,
              title: "Userdata Purge",
              description: "Your userdata has successfully been purged.",
            }),
          ],
          components: [],
        });
      } else {
        interactionCollector.stop("CANCELLED");
      }
    });

    interactionCollector.on("end", async (collected, signal) => {
      if (collected.size == 0 || signal == "CANCELLED") {
        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              color: Colors.Red,
              title: "Userdata Purge",
              description: "Prompt cancelled or timed out.",
            }),
          ],
          components: [],
        });
      }
    });

    return [true, ""];
  };
}
