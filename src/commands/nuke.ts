import { Message, TextChannel, EmbedBuilder, time } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import dayjs from "dayjs";
import { getColor } from "../libs/others";

const command: PrefixCommand = {
  data: {
    name: "nuke",
    description: "Delete all slot channels.",
    usage: "nuke",
    category: "Seller",
    cooldown: 7200,
  },
  execute: async (msg: Message, args: string[]) => {
    const userslot = slotLib.getSlotByUserId(msg.author.id);
    if (!userslot || userslot.status !== "active") {
      return await msg.reply(":x: You don't have an active slot.");
    }

    const channel = (await msg.client.channels
      .fetch(userslot.channelid)
      .catch(() => null)) as TextChannel;
    if (!channel) {
      return await msg.reply(":x: Unable to find your slot channel.");
    }

    await channel.delete("Slot channel deleted for nuke").catch(() => null);

    const newch = await msg.guild?.channels.create({
      name: channel.name,
      parent: channel.parentId,
      type: channel.type,
      permissionOverwrites: channel.permissionOverwrites.cache.map(
        (overwrite) => ({
          id: overwrite.id,
          allow: overwrite.allow.bitfield,
          deny: overwrite.deny.bitfield,
          type: overwrite.type,
        })
      ),
      position: channel.position,
    });
    if (!newch) {
      return await msg.reply(":x: Unable to create a new channel.");
    }

    slotLib.updateSlot(userslot.userId, { channelid: newch.id });

    // const createdAt = dayjs(Number(userslot.createdAt) * 1000);
    // const expiresAt = dayjs(Number(userslot.expiresAt) * 1000);
    // const diff = expiresAt.diff(createdAt, "day");

    const embed = new EmbedBuilder(userslot.embeddata)

    await newch.send({
      embeds: [embed],
    });

    await newch.send({
      content: `Recently, this slot has been nuked`,
    });
    await msg.reply({
      content: `:white_check_mark: Your slot channel has been nuked and a new one has been created.`,
    });
  },
};

export default command;