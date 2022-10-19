import { Knex } from "knex";
import { User } from "../../../Interfaces.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  CommandInteraction,
  ComponentType,
} from "discord.js";
import { BaseCommand } from "../../classes/BaseCommand.js";

import pkg, { PlayerInfo } from "noblox.js";
const { getIdFromUsername, getPlayerInfo, getPlayerThumbnail, getBlurb } = pkg;

export default class VerifyCommand extends BaseCommand {
  name = "verify";
  description =
    "Allows users to authenticate their discord accout through ROBLOX.";
  usage = "/verify";

  cooldown = 5;

  constructor(Bot) {
    super(Bot);
  }

  onCommand = async function (
    Interaction: CommandInteraction
  ): Promise<[boolean, string]> {
    if (!Interaction.inCachedGuild()) return;

    // const console = this.Bot.console;

    const guild = Interaction.guild;
    const member = Interaction.member;
    const channel = Interaction.channel;

    const database: Knex = this.NECos.database;
    const existingUser = await database<User>("users")
      .where("user_id", member.id.toString())
      .first();

    if (existingUser) {
      try {
        await new Promise<void>(async (resolve, reject) => {
          const interactionCollector = channel.createMessageComponentCollector({
            filter: (interaction) => interaction.member.id === member.id,
            time: 60_000,
            componentType: ComponentType.Button,
            maxComponents: 1,
          });

          interactionCollector.on("collect", async (interaction) => {
            try {
              await interaction.deferUpdate();
            } catch (error) {}

            const interactionConfirmed = interaction.customId === "true";

            if (interactionConfirmed) {
              resolve();
            } else {
              reject();
            }
          });

          interactionCollector.on("end", (collected) => {
            if (collected.size == 0) {
              reject();
            }
          });

          const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            [
              new ButtonBuilder()
                .setLabel("Confirm")
                .setStyle(ButtonStyle.Success)
                .setCustomId("true"),
              new ButtonBuilder()
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("false"),
            ]
          );

          await Interaction.editReply({
            components: [actionRow],

            embeds: [
              this.Bot.createEmbed({
                title: "NECos Verification",
                description: `It appears you are already verified with NECos (userId ${existingUser.user_id}). If you wish to re-verify to update your user information, please press continue, else, cancel.`,
                footer: {
                  text: "Prompt will automatically cancel after one minute.",
                },

                color: Colors.Orange,
              }),
            ],
          });
        });
      } catch (error) {
        await Interaction.editReply({
          components: [],
          embeds: [
            this.Bot.createEmbed({
              title: "NECos Verification",
              description: `Prompt cancelled or timed out.`,

              color: Colors.Red,
            }),
          ],
        });

        return [true, ""];
      }
    }

    var username = "";
    var userId = 0;
    var playerInfo: PlayerInfo;
    var thumbnailUrl = "";
    var userdataConfirmed = false;
    var embedFields = [];
    var usernameMessage;

    while (!userdataConfirmed) {
      try {
        username = await new Promise<string>(async (resolve, reject) => {
          const messageCollector = channel.createMessageCollector({
            filter: (message) => message.author.id === member.id,
            time: 60_000,
            max: 1,
          });

          messageCollector.on("collect", async (message) => {
            usernameMessage = message;
            resolve(message.content);
          });

          messageCollector.on("end", (collected) => {
            if (collected.size == 0) {
              reject();
            }
          });

          const replyData = {
            components: [],
            embeds: [
              this.Bot.createEmbed({
                title: "NECos Verification",
                description: `Welcome to ${guild.name}. This server uses NECos verification as the primary utility to verify the identities of those who join the server. To begin, please send your username.`,
                footer: {
                  text: "Prompt will automatically cancel after one minute.",
                },

                color: Colors.Green,
              }),
            ],
          };

          await Interaction.editReply(replyData);
        });
      } catch (error) {
        userdataConfirmed = true;

        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              title: "NECos Verification",
              description: `Prompt cancelled or timed out.`,

              color: Colors.Red,
            }),
          ],
        });

        return [true, ""];
      }

      try {
        userId = await getIdFromUsername(username);
        playerInfo = await getPlayerInfo(userId);
      } catch (error) {
        var replied = false;

        const messageContent = `No user was found matching username ${username}. Please ensure you typed the username correctly, and sent it again.`;

        try {
          await usernameMessage.reply(messageContent);
          replied = true;
        } catch (error) {}

        if (!replied) {
          try {
            const interactionReply = await Interaction.fetchReply();
            await interactionReply.reply(messageContent);
          } catch (error) {}
        }

        console.warn(error);

        continue;
      }

      embedFields = [
        {
          name: "Username",
          value: `${
            (playerInfo.username != "" && playerInfo.username) || "Unknown."
          }`,
          inline: true,
        },
        {
          name: "Display Name",
          value: `${
            (playerInfo.displayName != "" && playerInfo.displayName) || "None."
          }`,
          inline: true,
        },
        {
          name: "Join Date",
          value: `${playerInfo.joinDate.toString()}`,
          inline: true,
        },
        {
          name: "Blurb / Bio",
          value: `${(playerInfo.blurb != "" && playerInfo.blurb) || "None."}`,
          inline: true,
        },
      ];

      try {
        var thumbnailData = await getPlayerThumbnail(
          userId,
          "720x720",
          "png",
          false,
          "body"
        );
        thumbnailUrl = thumbnailData[0].imageUrl;
      } catch (error) {
        console.warn(
          `Failed to get playerThumbnail for userId ${userId} (${username}). ${error}`
        );
      }

      try {
        userdataConfirmed = await new Promise<boolean>(
          async (resolve, reject) => {
            const interactionCollector =
              channel.createMessageComponentCollector({
                filter: (interaction) => interaction.member.id === member.id,
                time: 60_000,
                componentType: ComponentType.Button,
                maxComponents: 1,
              });

            interactionCollector.on("collect", async (interaction) => {
              try {
                interaction.deferUpdate();
              } catch (error) {}

              switch (interaction.customId) {
                case "yes":
                  resolve(true);
                case "no":
                  resolve(false);
                case "cancel":
                  reject();
              }
            });

            interactionCollector.on("end", (collected) => {
              if (collected.size == 0) {
                reject();
              }
            });

            const actionRow =
              new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder()
                  .setLabel("Yes")
                  .setStyle(ButtonStyle.Success)
                  .setCustomId("yes"),
                new ButtonBuilder()
                  .setLabel("No")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("no"),
                new ButtonBuilder()
                  .setLabel("Cancel")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("cancel"),
              ]);

            await Interaction.editReply({
              components: [actionRow],

              embeds: [
                this.Bot.createEmbed({
                  title: "NECos Verification",
                  description: `Please verify the below information corresponds to your ROBLOX account.`,
                  fields: embedFields,
                  footer: {
                    text: "Prompt will automatically cancel after one minute.",
                  },

                  thumbnail: {
                    url: thumbnailUrl,
                  },

                  color: Colors.Orange,
                }),
              ],
            });
          }
        );
      } catch (error) {
        userdataConfirmed = true;

        await Interaction.editReply({
          components: [],
          embeds: [
            this.Bot.createEmbed({
              title: "NECos Verification",
              description: `Prompt cancelled or timed out.`,

              color: Colors.Red,
            }),
          ],
        });

        return [true, ""];
      }
    }

    const codeWords = [
      "teal",
      "red",
      "blue",
      "cyan",
      "orange",
      "pink",
      "green",
      "purple",
      "yellow",
    ];

    function generateCode(wordCount = 6): string {
      let string = [];

      for (let i = 0; i < wordCount; i++) {
        string.push(codeWords[Math.floor(Math.random() * codeWords.length)]);
      }

      return string.join(" ");
    }

    var verificationCode = "";
    var codeConfirmed = false;

    while (!codeConfirmed) {
      verificationCode = generateCode();
      var codeMessage;

      try {
        codeConfirmed = await new Promise<boolean>(async (resolve, reject) => {
          const interactionCollector = channel.createMessageComponentCollector({
            filter: (interaction) => interaction.member.id === member.id,
            time: 180_000,
            componentType: ComponentType.Button,
            maxComponents: 1,
          });

          interactionCollector.on("collect", async (interaction) => {
            try {
              await interaction.deferUpdate();
            } catch (error) {}

            switch (interaction.customId) {
              case "done":
                resolve(true);
              case "regen":
                resolve(false);
              case "cancel":
                reject();
            }
          });

          interactionCollector.on("end", (collected) => {
            if (collected.size == 0) {
              reject();
            }
          });

          const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            [
              new ButtonBuilder()
                .setLabel("Done")
                .setStyle(ButtonStyle.Success)
                .setCustomId("done"),
              new ButtonBuilder()
                .setLabel("Regenerate Code")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("regen"),
              new ButtonBuilder()
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("cancel"),
            ]
          );

          var replied = false;
          var messageContent = `Please enter the following code in your ROBLOX blurb / bio. When you're done, press the above "done" button. \`${verificationCode}\``;

          try {
            codeMessage = await usernameMessage.reply(messageContent);
            replied = true;
          } catch (error) {}

          if (!replied) {
            try {
              const interactionReply = await Interaction.fetchReply();
              codeMessage = await interactionReply.reply(messageContent);
            } catch (error) {}
          }

          await Interaction.editReply({
            components: [actionRow],

            embeds: [
              this.Bot.createEmbed({
                title: "NECos Verification",
                description: `Please enter the below code in your ROBLOX blurb / bio. When you're done, press "done".`,
                fields: embedFields,
                footer: {
                  text: "Prompt will automatically cancel after three minutes.",
                },

                color: Colors.Orange,
              }),
            ],
          });
        });

        try {
          await codeMessage.delete();
        } catch (error) {}

        if (!codeConfirmed) continue;

        codeConfirmed = await new Promise<boolean>(async (resolve, reject) => {
          const blurb = await getBlurb(userId);

          embedFields[3].value = `${
            (playerInfo.blurb != "" && playerInfo.blurb) || "None."
          }`;

          const codeFound = blurb.includes(verificationCode);

          if (codeFound) {
            resolve(true);
          } else {
            var replied = false;
            var messageContent = `A matching code was not found in user's blurb / bio. Please try again.`;

            try {
              const notFoundUserMessage = await usernameMessage.reply(
                messageContent
              );

              setTimeout(notFoundUserMessage.delete, 10_000);

              replied = true;
            } catch (error) {}

            if (!replied) {
              try {
                const interactionReply = await Interaction.fetchReply();
                const notFoundInteractionMessage = await interactionReply.reply(
                  messageContent
                );

                setTimeout(notFoundInteractionMessage.delete, 10_000);
              } catch (error) {}
            }

            resolve(false);
          }
        });
      } catch (error) {
        if (codeMessage) {
          try {
            await codeMessage.delete();
          } catch (error) {}
        }
        await Interaction.editReply({
          components: [],
          embeds: [
            this.Bot.createEmbed({
              title: "NECos Verification",
              description: `Prompt cancelled or timed out.`,

              color: Colors.Red,
            }),
          ],
        });

        return [true, ""];
      }
    }

    try {
      if (existingUser) {
      } else {
        await database<User>("users").insert({
          user_id: member.id.toString(),
          roblox_id: userId,
        });
      }
    } catch (error) {
      await Interaction.editReply({
        components: [],
        embeds: [
          this.Bot.createEmbed({
            title: "NECos Verification",
            description:
              "An unexpected error occured whilst creating the user. This error has been reported. Please try again.",
            color: Colors.Red,
          }),
        ],
      });
      return [true, ""];
    }

    await Interaction.editReply({
      components: [],
      embeds: [
        this.Bot.createEmbed({
          title: "NECos Verification",
          description:
            "Your account has successfully been verified with NECos. Please run /update to obtain roles.",
          fields: embedFields,

          color: Colors.Green,
        }),
      ],
    });

    return [true, ""];
  };
}
