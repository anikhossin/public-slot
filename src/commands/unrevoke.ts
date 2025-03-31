import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import { getColor } from "../libs/others";
import { logPost } from "../libs/logpost";

const UnrevokeCommand: PrefixCommand = {
    data: {
        name: "unrevoke",
        description: "Restore access to a previously revoked slot",
        usage: "unrevoke <@user> <reason (optional)>",
        aliases: ["urv"],
        category: "Admin",
        permissions: ['Administrator'],
    },
    execute: async (msg: Message, args: string[]) => {
        const user = msg.mentions.users.first();
        if (!user) {
            return await msg.reply(":x: You must mention a user to restore their slot access. Usage: `unrevoke <@user> <reason>`");
        }   
        const reason = args.slice(1).join(" ") || "No reason provided.";
        const userslot = slotLib.getSlotByUserId(user.id);
        if (!userslot) {
            return await msg.reply(`:x: ${user.tag} doesn't have a slot to restore.`);
        }
        if (userslot.status !== "revoked") {
            return await msg.reply(`:x: ${user.tag}'s slot is not currently revoked. Current status: ${userslot.status}`);
        }
        const channel = await msg.client.channels.fetch(userslot.channelid).catch(() => null) as TextChannel;
        if (!channel) {
            return await msg.reply(`:warning: Unable to find the slot channel. It may have been deleted manually.`);
        }
        
        const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle("📢 Slot Access Restored")
        .setDescription(`Your access to this slot has been restored by a server administrator.`)
        .addFields([
            { name: "🔍 Reason", value: reason, inline: true },
            { name: "⏱️ Restored At", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
        ])
        .setFooter({ text: `Restored by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() || "" })
        .setTimestamp();
        
        await channel.send({ embeds: [embed], content: `<@${user.id}>` });
        await channel.permissionOverwrites.edit(user.id, { SendMessages: true });
        slotLib.updateSlotStatus(user.id, "active");
        
        const successEmbed = new EmbedBuilder()
        .setColor(getColor())
        .setTitle("✅ Slot Access Restored Successfully")
        .setDescription(`${user.tag}'s slot access has been restored.`)
        .addFields([
            { name: "Channel", value: `<#${channel.id}>`, inline: true },
            { name: "Reason", value: reason, inline: true }
        ])
        .setTimestamp();
        
        await msg.reply({ embeds: [successEmbed] });
        await logPost(`Slot access restored for ${user.tag} by ${msg.author.tag}. Reason: ${reason}`, msg.client, "Action");
    }
}

export default UnrevokeCommand;
