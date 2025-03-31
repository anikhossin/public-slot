import { EmbedBuilder, Message, time } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import dayjs from "dayjs";
import { getColor } from "../libs/others";

const MySlotCommand: PrefixCommand = {
  data: {
    name: "myslot",
    description: "Check your current slot.",
    aliases: ["p"],
    category: "Seller",
    usage: "myslot",
  },
  execute: async (msg: Message, args: string[]) => {
    const userslot = slotLib.getSlotByUserId(msg.author.id);
    if (!userslot) {
      return await msg.reply(":x: You don't have an active slot.");
    }
    const embed = new EmbedBuilder()
      .setTitle(`Your Slot Information`)
      .addFields([
        { name: "Channel", value: `<#${userslot.channelid}>`, inline: true },
        { 
          name: "Status", 
          value: `${userslot.status === "active" ? "🟢" : "🔴"} ${userslot.status.charAt(0).toUpperCase() + userslot.status.slice(1)}`, 
          inline: true 
        },
        {
          name: "Expiration",
          value: `⏱️ ${time((dayjs(Number(userslot.expiresAt) * 1000).unix()), "R")}`,
          inline: true,
        },
        {
          name: "Pings Remaining",
          value: `\`\`\`@here: ${userslot.pings.here.current}/${userslot.pings.here.max}\n@everyone: ${userslot.pings.everyone.current}/${userslot.pings.everyone.max}\`\`\``,
          inline: false,
        },
      ])
      .setColor(getColor())
      .setFooter({ text: `Requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() || "" })
      .setTimestamp();
      await msg.reply({ embeds: [embed] });
  },
};

export default MySlotCommand;