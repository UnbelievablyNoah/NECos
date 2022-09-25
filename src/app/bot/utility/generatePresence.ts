/**
 * @name generatePresence.ts
 * @description Function that generates presence data
 * @author imskyyc
 * @repository https://github.com/Nuclear-Engineering-Co/NECos-Bun
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
 */

// For all activity types, see https://discord-api-types.dev/api/discord-api-types-v10/enum/ActivityType
const presenceTable = [
    {
        status: "dnd",
        activities: [
            {
                name: "the discord bot wars of 2042...",
                type: 5 // Competing
            }
        ]
    },
    {
        status: "online",
        activities: [
            {
                name: "some games",
                type: 0 // Playing
            }
        ]
    },
    {
        status: "idle",
        activities: [
            {
                name: "some random events",
                type: 2 // Listening
            }
        ]
    },
    {
        status: "dnd",
        activities: [
            {
                name: "you.",
                type: 3
            }
        ]
    }
]

module.exports = async (NECos) => {
    const presenceData = { ...presenceTable[Math.floor(Math.random() * presenceTable.length)] }

    presenceData.activities[0].name += `\nNECos version ${NECos.version}`
}