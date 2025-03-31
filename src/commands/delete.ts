import { Message } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import { loadConfig } from "../libs/others";
import { logPost } from "../libs/logpost";

const deletCOmmand: PrefixCommand = {
  data: {
    name: "delete",
    description: "Delete a slot channel.",
    usage: "delete <user>",
    aliases: ["del"],
    category: "Admin",
    permissions: ["Administrator"],
  },
  execute: async (msg: Message, args: string[]) => {
    const user = msg.mentions.users.first();
    if (!user) {
      return await msg.reply(
        ":x: You must mention a user to delete their slot channel."
      );
    }
    const userslot = slotLib.getSlotByUserId(user.id);
    if (!userslot) {
      return await msg.reply(`:x: ${user.tag} doesn't have a slot to delete.`);
    }

    const channel = await msg.client.channels
      .fetch(userslot.channelid)
      .catch(() => null);
    if (!channel) {
      return await msg.reply(
        `:warning: Unable to find the slot channel. It may have been deleted manually.`
      );
    }
    const config = loadConfig();
    if (!config) {
      return await msg.reply(":warning: Unable to load the configuration.");
    }
    const role = await msg.guild?.roles
      .fetch(config.slot.sellerRole)
      .catch(() => null);
    if (!role) {
      return await msg.reply(":warning: Unable to find the seller role.");
    }
    const member = await msg.guild?.members.fetch(user.id).catch(() => null);
    if (!member) {
      return await msg.reply(
        ":warning: Unable to find the user in the server."
      );
    }
    await member.roles.remove(role).catch(() => null);
    await channel.delete("Slot channel deleted by admin").catch(() => null);
    slotLib.deleteSlot(user.id);

    await msg.reply(
      `:white_check_mark: ${user.tag}'s slot channel has been deleted and their role has been removed.`
    );
    await logPost(
      `Slot channel deleted for ${user.tag} by ${msg.author.tag}.`,
      msg.client,
      "Action"
    );
  },
};

export default deletCOmmand;