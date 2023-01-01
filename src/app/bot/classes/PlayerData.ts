import { AudioPlayer, AudioPlayerState } from "@discordjs/voice";
import { Guild } from "discord.js";

export class PlayerData {
  guild: Guild = null;
  audioPlayer: AudioPlayer = null;
  queue: Array<string> = [];
  isPlaying = false;

  constructor(guild: Guild, audioPlayer: AudioPlayer) {
    this.guild = guild;
    this.audioPlayer = audioPlayer;

    this.audioPlayer.on("stateChange", this.onStateChange);
  }

  onStateChange = async (state: AudioPlayerState) => {
    console.log(state);
  };

  bumpQueue = async () => {
    if (this.isPlaying) return;

    while (this.isPlaying) {}
  };
}
