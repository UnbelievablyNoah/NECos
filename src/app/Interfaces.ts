import { PermissionFlagsBits, WebhookClient } from "discord.js";

export interface User {
  id: number;
  user_id: string;
  roblox_id: number;
  created_at: string;
  updated_at: string;
}

export interface OwnedAsset {
  type: string;
  gameId: number;
  assetId: number;
}

export interface CachedUserData {
  groups: { [groupId: number]: number };
  ownedAssets: Array<OwnedAsset>;
}

export interface Guild {
  id: number;
  guild_id: string;
  configuration: string;
  command_permissions: string;
  verification_bind_data: string;
  mod_actions: string;
}

export interface GuildConfiguration {
  channels: {
    auditLogs: string;
    commandLogs: string;
  };

  commandPermissions: {
    [commandName: string]: Array<typeof PermissionFlagsBits>;
  };
}

export interface Affiliate {
  id: string;
  discord_id: string;
  group_name: string;
  group_id: string;
  owner_id: string;
  invite: string;
  data_cache: string;
  representatives: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateGuildData {
  guildId: string;
  announcementWebhookClients: Array<WebhookClient>;
  listenerChannelIds: Array<string>;
}

export interface RoleBindData {
  type: string;
  data: string;
}

export interface BoundRole {
  role_id: string;
  binds: Array<RoleBindData>;
  isDefault: boolean;
}
