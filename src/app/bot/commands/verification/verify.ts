import type { CommandInteraction } from "discord.js";

export default class VerifyCommand {
  NECos = null

  name = "verify"
  description = "Allows users to authenticate their discord accout through ROBLOX."

  constructor(NECos) {
    this.NECos = NECos
  }

  onCommand = async (Interaction: CommandInteraction) => {

  }
}
