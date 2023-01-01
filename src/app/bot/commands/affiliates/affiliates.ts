import {
  ChatInputCommandInteraction,
  Colors,
  CommandInteraction,
  EmbedData,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from "discord.js";
import { Knex } from "knex";
import Noblox from "noblox.js";
import { Affiliate } from "../../../Interfaces.js";
import { BaseCommand } from "../../classes/BaseCommand.js";

const { getGroup, getGroupSocialLinks, getGroupGames } = Noblox;

export default class AffiliatesCommand extends BaseCommand {
  name = "affiliates";
  description =
    "Allows guild members to list group affiliates, OR affiliate owners to change their affiliate data.";
  usage = "/affiliates subcommand";

  cooldown = 20;

  constructor(Bot) {
    super(Bot);
  }

  subCommands = [
    {
      name: "list",
      description: "Lists all group affiliates.",

      options: [
        new SlashCommandNumberOption()
          .setName("page")
          .setDescription("The page of affiliates to view.")
          .setRequired(false),
      ],

      onCommand: async (Interaction: ChatInputCommandInteraction) => {
        const options = Interaction.options;
        const database: Knex = this.NECos.database;
        const affiliates = await database<Affiliate>("affiliates").select("*");
        const affiliateEmbeds = [];

        const pageNumber = options.getNumber("page");
        const pages =
          (affiliates.length > 5 && Math.floor(affiliates.length / 5)) || 1;

        for (const index in affiliates) {
          if (pageNumber && pages > 1 && parseInt(index) < pageNumber) continue;

          const affiliate = affiliates[index];
          const groupId = parseInt(affiliate.group_id);

          let groupData = JSON.parse(affiliate.data_cache);
          let now = Date.now();

          // if (true) {
          if (now - groupData.last_update > 600_0000) {
            let refreshedData = {
              description: "Failed to fetch.",
              memberCount: -1,
              thumbnail: undefined,
              socials: [],
              games: [],
            };

            try {
              await getGroup(groupId).then((data) => {
                refreshedData.description = data.description;
                refreshedData.memberCount = data.memberCount;
              });

              await fetch(
                `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${affiliate.group_id}&size=420x420&format=Png&isCircular=false`
              )
                .then((response) => response.json())
                .then((thumbnailData) => {
                  const data = thumbnailData.data[0];

                  if (data.state == "Completed") {
                    refreshedData.thumbnail = { url: data.imageUrl };
                  }
                });

              await getGroupSocialLinks(groupId).then((socialLinks) => {
                for (const social of socialLinks)
                  refreshedData.socials.push(`[${social.type}](${social.url})`);
              });
            } catch (error) {}

            groupData = refreshedData;

            await database("affiliates")
              .update(
                "data_cache",
                JSON.stringify({ last_update: now, ...groupData })
              )
              .where({
                group_id: affiliate.group_id,
                discord_id: Interaction.guild.id,
              });
          }

          const affiliateEmbed: EmbedData = {
            title: affiliate.group_name,
            description: `${groupData.description.substring(0, 200)}${
              groupData.description.length > 200 && "..."
            }`,
            url: `https://roblox.com/groups/${affiliate.group_id}`,
            thumbnail: groupData.thumbnail,

            fields: [
              {
                name: "Owner",
                value: `<@${affiliate.owner_id}>`,
              },

              {
                name: "Member Count",
                value: `${groupData.memberCount}`,
              },

              {
                name: "Invite",
                value: `${affiliate.invite}`,
              },

              {
                name: "Link",
                value: `https://roblox.com/groups/${affiliate.group_id}/`,
              },
            ],

            color: Colors.Green,
          };

          if (groupData.socials.length > 0) {
            affiliateEmbed.fields.push({
              name: "Socials",
              value: groupData.socials.join("\n"),
            });
          }

          affiliateEmbeds.push(affiliateEmbed);
        }

        await Interaction.editReply({
          content: `Showing page ${pageNumber || 1} of ${pages} page(s).`,
          embeds: affiliateEmbeds,
        });

        return [true, ""];
      },
    },

    {
      name: "link",
      description:
        "Allows group affiliate owners to link their group to the discord.",

      options: [
        new SlashCommandStringOption()
          .setName("link")
          .setDescription("The link to the Roblox group.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: CommandInteraction) => {},
    },

    {
      name: "unlink",
      description:
        "Allows group affiliate owners to unlink their group from the discord.",

      options: [
        new SlashCommandStringOption()
          .setName("link")
          .setDescription("The link to the Roblox group.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: CommandInteraction) => {},
    },

    {
      name: "addrep",
      description:
        "Allows group affiliate owners to link representatives to their group (grants role).",

      options: [
        new SlashCommandUserOption()
          .setName("representative")
          .setDescription("The representative to link.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: CommandInteraction) => {},
    },

    {
      name: "listreps",
      description:
        "Allows guild members to list the representatives for a group affiliate.",

      options: [
        new SlashCommandStringOption()
          .setName("group")
          .setDescription("The link to the group affiliate's Roblox group.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: CommandInteraction) => {},
    },

    {
      name: "delrep",
      description:
        "Allows group affiliate owners to remove representatives from their group (revokes role).",

      options: [
        new SlashCommandUserOption()
          .setName("representative")
          .setDescription("The representative to remove.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: CommandInteraction) => {},
    },
  ];
}
