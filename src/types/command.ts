import { PermissionResolvable, Message } from "discord.js";

export type CommandCategory = "Admin" | "Seller" | "Utils";

export interface PrefixCommand {
  data: {
    name: string;
    description: string;
    usage: string;
    aliases?: string[];
    category: CommandCategory;
    cooldown?: number;
    permissions?: PermissionResolvable[];
  };
  execute: (message: Message, args: string[]) => Promise<any>;
}
