import {
  ChatInputCommandInteraction,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  EmbedData,
  SlashCommandIntegerOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from "discord.js";
import { Knex } from "knex";
import Noblox from "noblox.js";
import { Affiliate, User } from "../../../Interfaces.js";
import { BaseCommand } from "../../classes/BaseCommand.js";

const { getGroup, getGroupSocialLinks, getGroupGames } = Noblox;

export default class AffiliatesCommand extends BaseCommand {
  name = "affiliates";
  description =
    "Allows guild members to list group affiliates, OR affiliate owners to change their affiliate data.";
  usage = "/affiliates subcommand";

  cooldown = 15;

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
        const pages = (affiliates.length > 2 && Math.ceil(affiliates.length / 2)) || 1;
        let pageNumber = options.getNumber("page");

        if (!pageNumber) {
          pageNumber = 1;
        }

        if (pageNumber > pages) {
          pageNumber = pages;
        } 

        for (const index in affiliates) {
          let start = (pageNumber - 1) * 2;
          let end = pageNumber * 2;
          let numIndex = parseInt(index)
          
          if (!(numIndex >= start && numIndex < end)) continue;

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
              (groupData.description.length > 200 && "...") || ""
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
        "Allows group affiliate owners to link their group to the Discord.",

      options: [
        new SlashCommandStringOption()
          .setName("link")
          .setDescription("The link to the Roblox group.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: ChatInputCommandInteraction<"cached">) => {
        const options = Interaction.options;
        const member = Interaction.member;
        const guild = Interaction.guild;
        const database: Knex = this.NECos.database;

        const groupLink = options.getString("link", true).trim();
        const groupUrlData = groupLink.substring(30);
        const groupUrlComponents = groupUrlData.split("/");
        const groupId = parseInt(groupUrlComponents[0]);

        if (!groupId || typeof groupId != "number")
          return [
            false,
            `groupId must be a number. Provided: ${groupUrlComponents[0]}`,
          ];

        // Check if group exists
        const dbAffiliates = await database<Affiliate>("affiliates")
          .select("*");

        let existingAffiliate = undefined;

        for (const affiliate of dbAffiliates) {
          if (affiliate.discord_id == guild.id && affiliate.group_id == groupUrlComponents[0]) {
            existingAffiliate = affiliate;
            break;
          }
        }

        if (existingAffiliate)
          return [false, `An affiliate matching groupId ${groupId} already exists!`];

        // Verify owner of group
        // Get user
        const user = await database<User>("users")
          .select("*")
          .where("user_id", member.id)
          .first();
        if (!user)
          return [
            false,
            `No userdata was found for ${member.user.tag}. Are you verified? (/verify)`,
          ];

        // Get group info
        const groupData = await getGroup(groupId);
        if (groupData.owner.userId != user.roblox_id)
          return [
            false,
            `Ownership of group ${groupData.name} could not be verified. Only the owner of the group can run the /link command.`,
          ];

        // Get relationship status
        const allies = await fetch(
          `https://groups.roblox.com/v1/groups/${this.NECos.configuration.roblox.primary_group}/relationships/allies?model.startRowIndex=0&model.maxRows=100`
        ).then((response) => response.json());

        let foundGroup = undefined;

        for (const relatedGroup of allies.relatedGroups) {
          if (relatedGroup.id == groupId) {
            foundGroup = relatedGroup;
            break;
          }
        }

        if (!foundGroup)
          return [
            false,
            `${groupData.name} is not allied with ${guild.name}. Please contact the guild owner if you believe this is a mistake.`,
          ];

        await database<Affiliate>("affiliates").insert({
          discord_id: guild.id,
          group_name: groupData.name,
          group_id: groupData.id.toString(),
          owner_id: member.id,
        });

        const representativeRole = guild.roles.cache.find(r => r.name.includes("Group Representative"))
        const errors = [];

        if (representativeRole) {
          try {
            await member.roles.add(representativeRole)
          } catch (error) {
            errors.push(`Failed to add Group Representative role to <@${member.id}>: ${error}`)
          }
        }

        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              title: "Affiliate Group Linked",
              description: `${groupData.name} has successfully been linked to this guild.${(errors.length > 0 && "Errors:\n" + errors.join("\n")) || ""}`,
              color: Colors.Green,
            }),
          ],
        });

        return [true, ""];
      },
    },

    {
      name: "unlink",
      description:
        "Allows group affiliate owners to unlink their group from the Discord.",

      options: [
        new SlashCommandIntegerOption()
          .setName("groupid")
          .setDescription("The ID of the group.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: ChatInputCommandInteraction<"cached">) => {
        const options = Interaction.options;
        const member = Interaction.member;
        const guild = Interaction.guild;

        const database: Knex = this.NECos.database;

        // Find linked affiliate
        const groupId = options.getInteger("groupid");
        const dbAffiliates = await database<Affiliate>("affiliates")
          .select("*");

        let affiliate: Affiliate = undefined;

        for (const dbAffiliate of dbAffiliates) {
          if (dbAffiliate.discord_id == guild.id && dbAffiliate.group_id == groupId.toString()) {
            affiliate = dbAffiliate;
            break;
          }
        }

        if (!affiliate) return [false, `No affiliate was found for this guild matching groupId ${groupId}.`]
        if (affiliate.owner_id != member.id) return [false, "Only the owner of the group can un-link it."]

        const representatives = JSON.parse(affiliate.representatives);
        const representativeRole = guild.roles.cache.find(r => r.name.includes("Group Representative"))
        const errors = [];

        if (representativeRole) {
          for (const representative of representatives) {
            const guildMember = await guild.members.resolve(representative);
            if (!guildMember) continue;
  
            let isRepresentative = false;
            for (const dbAffiliate of dbAffiliates) {
              const affiliateRepresentatives = JSON.parse(dbAffiliate.representatives);
              
              if (affiliateRepresentatives.includes(guildMember.id)) isRepresentative = true;
            }
  
            if (isRepresentative) continue;

            try {
              await guildMember.roles.remove(representativeRole)
            } catch (error) {
              errors.push(`Failed to remove Group Representative role from <@${guildMember.id}>: ${error}`)
            }
          }
        }

        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              title: "Affiliate Group Deleted",
              description: `Your affiliate group has been successfully unlinked from the Discord.${(errors.length > 0 && "Errors:\n" + errors.join("\n")) || ""}`,
              color: Colors.Green
            })
          ]
        })

        return [true, ""]
      },
    },

    {
      name: "setinvite",
      description:
        "Allows group affiliate owners & representatives to change the invite link to their server.",

      options: [
        new SlashCommandIntegerOption()
          .setName("groupid")
          .setDescription("The ID of the group.")
          .setRequired(true),
        new SlashCommandStringOption()
          .setName("invite")
          .setDescription("The invite to the guild.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: ChatInputCommandInteraction) => {
        const options = Interaction.options;
        const member = Interaction.member;
        const guild = Interaction.guild;

        const database: Knex = this.NECos.database;
        const groupId = options.getInteger("groupid", true);
        const invite = options.getString("invite", true);

        const affiliate = await database<Affiliate>("affiliates")
          .select("*")
          .where({
            group_id: groupId.toString(),
            discord_id: guild.id
          })
          .first()

        if (!affiliate) return [false, `No group was found matching groupId ${groupId}.`]
        if (affiliate.owner_id != member.user.id) return [false, `Only the owner of the group can run the setinvite command.`,]
        
        await database("affiliates")
          .update("invite", invite)
          .where({
            group_id: groupId.toString(),
            discord_id: guild.id
          })

        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              title: "Affiliate Invite Updated",
              description: `The invite for ${affiliate.group_name} has been updated to ${invite}.`,
              color: Colors.Green
            })
          ]
        })

        return [true, ""]
      }
    },

    {
      name: "addrep",
      description:
        "Allows group affiliate owners to link representatives to their group (grants role).",

      options: [
        new SlashCommandIntegerOption()
          .setName("groupid")
          .setDescription("The ID of the group.")
          .setRequired(true),
        new SlashCommandUserOption()
          .setName("representative")
          .setDescription("The representative to link.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: ChatInputCommandInteraction) => {
        const options = Interaction.options;
        const member = Interaction.member;
        const guild = Interaction.guild;

        const database: Knex = this.NECos.database;
        const groupId = options.getInteger("groupid", true);
        const representativeUser = options.getUser("representative", true);
        const representative = await guild.members.resolve(representativeUser.id);
        const representativeRole = guild.roles.cache.find(r => r.name.includes("Group Representative"));

        if (!representative) return [false, `No user matching userId ${representativeUser.id} could be found.`]
        if (!representativeRole) return [false, "No group representative role could be found. A group representative role must contain the name \"Group Representative\"."]

        const affiliate = await database<Affiliate>("affiliates")
          .select("*")
          .where({
            group_id: groupId.toString(),
            discord_id: guild.id
          })
          .first()

        if (!affiliate) return [false, `No group was found matching groupId ${groupId}.`]
        if (affiliate.owner_id != member.user.id) return [false, "Only the owner of the group can run the addrep command."]
        
        const representatives = JSON.parse(affiliate.representatives);
        if (representative.id == affiliate.owner_id) return [false, "The owner of the group cannot be an extra group representative."]
        if (representatives.length == 2) return [false, "Affiliate Groups can have no more than two extra group representatives."]
        if (representatives.includes(representative.id)) return [false, `<@${representative.id}> is already a group representative.`]

        representatives.push(representative.id);

        await database("affiliates")
          .update("representatives", JSON.stringify(representatives))
          .where({
            group_id: groupId.toString(),
            discord_id: guild.id
          })

        const errors = [];
        try {
          await representative.roles.add(representativeRole)
        } catch (error) {
          errors.push(`Failed to add Group Representative role to <@${representative.id}>: ${error}`)
        }

        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              title: "Affiliate Representative Added",
              description: `Successfully added <@${representative.id}> as a group representative.${(errors.length > 0 && "Errors:\n" + errors.join("\n")) || ""}`,
              color: Colors.Green
            })
          ]
        })

        return [true, ""]
      },
    },

    {
      name: "listreps",
      description:
        "Allows guild members to list the representatives for a group affiliate.",

      options: [
        new SlashCommandIntegerOption()
          .setName("groupid")
          .setDescription("The ID of the group.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: ChatInputCommandInteraction) => {
        const options = Interaction.options;
        const guild = Interaction.guild;
        const database: Knex = this.NECos.database;

        const groupId = options.getInteger("groupid", true);
        const affiliate = await database<Affiliate>("affiliates")
          .select("*")
          .where({
            group_id: groupId.toString(),
            discord_id: guild.id
          })
          .first()

        if (!affiliate) return [false, `No affiliate could be found matching groupId ${groupId}.`]

        const representatives = JSON.parse(affiliate.representatives);
        const embeds = [];

        for (const representative of representatives) {
          const guildMember = await guild.members.resolve(representative);
          if (!guildMember) continue;

          const representativeEmbed = new EmbedBuilder()
            .setTitle(guildMember.user.username)
            .setThumbnail(guildMember.user.avatarURL())
            .setDescription(`Representative of ${affiliate.group_name}.\n(I'd show more data here but Discord has no API Endpoints for it... :)`)
            .setColor(Colors.Blue)

          embeds.push(representativeEmbed);
        }

        await Interaction.editReply({
          content: `Listing representatives for ${affiliate.group_name}. (${embeds.length}):`,
          embeds: embeds
        })

        return [true, ""]
      },
    },

    {
      name: "delrep",
      description:
        "Allows group affiliate owners to remove representatives from their group (revokes role).",

      options: [
        new SlashCommandIntegerOption()
          .setName("groupid")
          .setDescription("The ID of the group.")
          .setRequired(true),
        new SlashCommandUserOption()
          .setName("representative")
          .setDescription("The representative to remove.")
          .setRequired(true),
      ],

      onCommand: async (Interaction: ChatInputCommandInteraction) => {
        const options = Interaction.options;
        const member = Interaction.member;
        const guild = Interaction.guild;

        const database: Knex = this.NECos.database;
        const groupId = options.getInteger("groupid", true);
        const representativeUser = options.getUser("representative", true);
        const representative = await guild.members.resolve(representativeUser.id);
        const representativeRole = guild.roles.cache.find(r => r.name.includes("Group Representative"));

        if (!representative) return [false, `No user matching userId ${representativeUser.id} could be found.`]
        if (!representativeRole) return [false, "No group representative role could be found. A group representative role must contain the name \"Group Representative\"."]

        const affiliate = await database<Affiliate>("affiliates")
          .select("*")
          .where({
            group_id: groupId.toString(),
            discord_id: guild.id
          })
          .first()

        if (!affiliate) return [false, `No group was found matching groupId ${groupId}.`]
        if (affiliate.owner_id != member.user.id) return [false, "Only the owner of the group can run the addrep command."]
        
        const representatives: Array<string> = JSON.parse(affiliate.representatives);
        if (!representatives.includes(representative.id)) return [false, `<@${representative.id}> is not a group representative.`]

        representatives.splice(representatives.indexOf(representative.id), 1)

        await database("affiliates")
          .update("representatives", JSON.stringify(representatives))
          .where({
            group_id: groupId.toString(),
            discord_id: guild.id
          })

        const errors = [];
        try {
          await representative.roles.remove(representativeRole)
        } catch (error) {
          errors.push(`Failed to remove Group Representative role to <@${representative.id}>: ${error}`)
        }

        await Interaction.editReply({
          embeds: [
            this.Bot.createEmbed({
              title: "Affiliate Representative Removed",
              description: `Successfully removed <@${representative.id}> as a group representative.${(errors.length > 0 && "Errors:\n" + errors.join("\n")) || ""}`,
              color: Colors.Green
            })
          ]
        })

        return [true, ""]
      },
    },
  ];
}
