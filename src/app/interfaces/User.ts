export interface User {
  id: number;
  user_id: string;
  roblox_id: number;
  created_at: string;
  updated_at: string;
}

export interface Guild {
  id: number;
  guild_id: string;
  configuration: string;
  command_permissions: string;
  verification_bind_data: string;
  mod_actions: string;
}
