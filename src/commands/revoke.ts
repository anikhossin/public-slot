import { EmbedBuilder, Message, TextChannel } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import { getColor } from "../libs/others";
import { logPost } from "../libs/logpost";

const RevokeCommand: PrefixCommand = {
    data: {
        name: "revoke",
        description: "Revoke a slot from a user",
        usage: "revoke <@user> <reason (optional)>",
        aliases: ["rv"],
        category: "Admin",
        permissions: ['Administrator'],
    },
    execute: async (msg: Message, args: string[]) => {
        const user = msg.mentions.users.first();
        if (!user) {
            return await msg.reply(":x: You must mention a user to revoke their slot. Usage: `revoke <@user> <reason>`");
        }   
        const reason = args.slice(1).join(" ") || "No reason provided.";
        const userslot = slotLib.getSlotByUserId(user.id);
        if (!userslot) {
            return await msg.reply(`:x: ${user.tag} doesn't have an active slot to revoke.`);
        }
        const channel = await msg.client.channels.fetch(userslot.channelid).catch(() => null) as TextChannel;
        if (!channel) {
            return await msg.reply(`:warning: Unable to find the slot channel. It may have been deleted manually.`);
        }
        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle("📢 Slot Access Revoked")
        .setDescription(`Your access to this slot has been revoked by a server administrator.`)
        .addFields([
            { name: "🔍 Reason", value: reason, inline: true },
            { name: "⏱️ Revoked At", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
        ])
        .setFooter({ text: `Revoked by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() || "" })
        .setTimestamp();
        await channel.send({ embeds: [embed], content: `<@${user.id}>` });
        await channel.permissionOverwrites.edit(user.id, { SendMessages: false });
        slotLib.updateSlotStatus(user.id, "revoked");
        
        const successEmbed = new EmbedBuilder()
        .setColor(getColor())
        .setTitle("✅ Slot Revoked Successfully")
        .setDescription(`${user.tag}'s slot access has been revoked.`)
        .addFields([
            { name: "Channel", value: `<#${channel.id}>`, inline: true },
            { name: "Reason", value: reason, inline: true }
        ])
        .setTimestamp();
        
        await msg.reply({ embeds: [successEmbed] });
        await logPost(`Slot revoked for ${user.tag} by ${msg.author.tag}. Reason: ${reason}`, msg.client, "Action");
    }
}

export default RevokeCommand;