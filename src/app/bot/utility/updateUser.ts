/**
 * @name updateUser.ts
 * @description Function that updates a GuildMember's roles and nickname
 * @author imskyyc
 * @repository https://github.com/Nuclear-Engineering-Co/NECos
 * @license AGPL3
 * @copyright Copyright (C) 2022 imskyyc (https://github.com/imskyyc)
   This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

 * @param { typeof NECos }
 * @returns Array<string>
 */

import { GuildMember, Guild } from "discord.js";
import { User, Guild as GuildData, CachedUserData } from "../../Interfaces.js";

import Noblox from "noblox.js";
const { getRankInGroup } = Noblox;

export default async (
  Bot,
  member: GuildMember,
  guild: Guild,
  guildData: GuildData,
  user: User
) => {
  const bindData = JSON.parse(guildData.verification_bind_data);
  const userData: CachedUserData = Bot.userCache[member.id.toString()] || {
    groups: {},
    ownedAssets: [],
  };

  const errors = [];

  for (const boundRole of bindData) {
    const binds = boundRole.binds;
    const isDefault = boundRole.isDefault;
    let canGetRole = false;

    if (isDefault) {
      canGetRole = true;
      break;
    } else {
      for (const roleBind of binds) {
        const roleType = roleBind.type;
        const roleData = roleBind.data;

        switch (roleType) {
          case "user":
            if (user.roblox_id.toString() == roleData) {
              canGetRole = true;
            }
            break;
          case "group":
            const groupDataComponents = roleData.split(":");

            const groupId = groupDataComponents[0];
            const minRank = groupDataComponents[1];
            const maxRank = groupDataComponents[2];

            let groupRank = userData.groups[groupId];
            if (!groupRank) {
              try {
                groupRank = await getRankInGroup(
                  parseInt(groupId),
                  user.roblox_id
                );
                userData.groups[groupId] = groupRank;
              } catch (error) {
                groupRank = 0;

                errors.push(error);
              }
            }

            if (!minRank && groupRank > 0) {
              canGetRole = true;
              break;
            }

            if (groupRank >= (minRank || 1) && groupRank <= (maxRank || 255)) {
              canGetRole = true;
              break;
            }

            break;
        }
      }
    }

    if (canGetRole) {
      const role = await guild.roles.resolve(boundRole.role_id);
      if (role) {
        try {
          await member.roles.add(role);
        } catch (error) {
          errors.push(`Error applying role: ${error}`);
        }
      } else {
        errors.push(`A role matching ${boundRole.role_id} was not found.`);
      }
    } else {
      const role = await member.roles.resolve(boundRole.role_id);
      if (role) {
        try {
          await member.roles.remove(role);
        } catch (error) {
          errors.push(`Error removing role: ${error}`);
        }
      }
    }
  }

  return errors;
};
