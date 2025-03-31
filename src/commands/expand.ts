import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import { logPost } from "../libs/logpost";
import dayjs from "dayjs";

const expandSlotCmd: PrefixCommand = {
  data: {
    name: "expand",
    description: "Extend the slot duration for a user",
    usage: "expand <@user> <duration>",
    aliases: ["ex"],
    category: "Admin",
    permissions: ["Administrator"],
  },
  execute: async (msg: Message, args: string[]) => {
    const user = msg.mentions.users.first();
    if (!user) {
      return await msg.reply("Invalid usage! Try `expand <@user> <duration>`");
    }
    const duration = args[1];
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      return await msg.reply(
        "Invalid duration! Please provide a positive number."
      );
    }
    const userslot = slotLib.getSlotByUserId(user.id);
    if (!userslot) {
      return await msg.reply(`:x: ${user.tag} doesn't have an active slot.`);
    }
    const channel = (await msg.client.channels
      .fetch(userslot.channelid)
      .catch(() => null)) as TextChannel;
    if (!channel) {
      return await msg.reply(
        `:warning: Unable to find the slot channel. It may have been deleted manually.`
      );
    }

    const newDuration = Number(duration);
    const oldExpiryDate = dayjs(Number(userslot.expiresAt) * 1000); 
    const newExpiryDate = oldExpiryDate.add(newDuration, "day");

    const oldExpiryTimestamp = oldExpiryDate.unix(); 
    const newExpiryTimestamp = newExpiryDate.unix(); 

    try {
      slotLib.updateSlot(user.id, {
        expiresAt: newExpiryTimestamp.toString(), 
        status: "active",
      });

      const embed = new EmbedBuilder()
        .setTitle("📢 Slot Duration Extended")
        .setDescription(
          `Your slot duration has been extended by **${newDuration} day${
            newDuration > 1 ? "s" : ""
          }**.`
        )
        .setColor("#00FF00")
        .addFields([
          {
            name: "⏱️ Previous Expiry",
            value: `<t:${oldExpiryTimestamp}:F>`,
            inline: true,
          },
          {
            name: "⏱️ New Expiry",
            value: `<t:${newExpiryTimestamp}:F>`,
            inline: true,
          },
          {
            name: "⌛ Extension",
            value: `${newDuration} day${newDuration > 1 ? "s" : ""}`,
            inline: true,
          },
        ])
        .setFooter({
          text: `Extended by ${msg.author.tag}`,
          iconURL: msg.author.displayAvatarURL() || "",
        })
        .setTimestamp();

      await channel.send({ embeds: [embed], content: `<@${user.id}>` });

      await msg.reply(
        `:white_check_mark: Successfully extended ${
          user.tag
        }'s slot duration by **${newDuration} day${
          newDuration > 1 ? "s" : ""
        }**.`
      );
      await logPost(
        `Slot duration extended for ${user.tag} by ${msg.author.tag}. New expiry: <t:${newExpiryTimestamp}:F>`,
        msg.client,
        "Action"
      );
    } catch (error) {
      console.error(`Error extending slot for ${user.tag}:`, error);
      await msg.reply(
        `:x: There was an error while extending the slot duration. Please try again later.`
      );
    }
  },
};
export default expandSlotCmd;
