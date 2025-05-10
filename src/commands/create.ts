import { CategoryChannel, channelMention, ChannelType, ColorResolvable, EmbedBuilder, Message, time } from "discord.js";
import { PrefixCommand } from "../types/command";
import { beautifyString, getRandomCode, loadConfig } from "../libs/others";
import slotLib from "../libs/slot.lib";
import dayjs from "dayjs";
import { logPost } from "../libs/logpost";

const CreateSlotCommand: PrefixCommand = {
  data: {
    name: "create-slot",
    description: "Create a new slot",
    usage: "create-slot <@user> <category number> <type>",
    aliases: ["create", "new-slot", "cs"],
    category: "Admin",
    permissions: ["Administrator"],
  },
  execute: async (message: Message, args: string[]) => {
    const user = message.mentions.users.first();
    if (!user) {
      return await message.reply(
        "Invalid usage! Try `create-slot <@user> <category number> <type>`"
      );
    }
    const categoryNumber = args[1];
    const type = args[2];
    if (!categoryNumber || !type) {
      return await message.reply(
        "Invalid usage! Try `create-slot <@user> <category number> <type>`"
      );
    }

    const config = loadConfig();
    if (!config) {
      return await message.reply("Config not found. Please contact the admin.");
    }
    const slot = config.slot;

    if (!slot.categories[categoryNumber]) {
      const availableCategories = Object.keys(slot.categories).join(", ");
      return await message.reply(
        `Invalid category number! Please use one of the following: ${availableCategories}`
      );
    }

    const categoryId = slot.categories[categoryNumber];

    const validTypes = Object.keys(slot.templates);
    if (!validTypes.includes(type)) {
      return await message.reply(
        "Invalid type! Please use one of the following types: " +
          validTypes.join(", ")
      );
    }

    const template = slot.templates[type];
    if (!template) {
      return await message.reply("Template not found. Please check the type.");
    }

    const userslot = slotLib.getSlotByUserId(user.id);
    if (userslot) {
        return await message.reply(
            `User already has a slot ${channelMention(userslot.channelid)}. Please delete it first.`
        );
    }

    const msg = await message.reply(
      `Creating slot for \`${user.username}\` in category ${categoryNumber} (ID: ${categoryId}) with type ${type}.`
    );

    const category = (await message.guild?.channels
      .fetch(categoryId)
      .catch(() => null)) as CategoryChannel;
    const sellerRole = await message.guild?.roles
      .fetch(slot.sellerRole)
      .catch(() => null);
    if (!category || !sellerRole) {
      return await message.reply(
        "Category or seller role not found. Please contact the admin tp check `config.json`."
      );
    }

    if (category.children.cache.size >= 50) {
      return await message.reply("Category is full! Try other category");
    }

    const channel = await message.guild?.channels.create({
      name: `・❥・${user.username}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: message.guild?.roles.everyone.id,
          deny: ["SendMessages"],
          allow: ["ViewChannel"],
        },
        {
          id: user.id,
          allow: [
            "SendMessages",
            "ViewChannel",
            "AttachFiles",
            "UseExternalEmojis",
          ],
        },
      ],
    });
    if (!channel) {
      return await message.reply("Failed to create channel. Please try again.");
    }

    
    const now = dayjs();
    const expiryDate = now.add(template.duration, 'day');
    
    const nowTimestamp = now.unix();
    const expiryTimestamp = expiryDate.unix();

    const restoreCode = getRandomCode();
    slotLib.addSlot({
        userId: user.id,
        channelid: channel.id,
        restoreCode: restoreCode,
        status: "active",
        duration: template.duration,
        pings: {
            here: {
                max: template.pings.here,
                current: 0,
            },
            everyone: {
                max: template.pings.everyone,
                current: 0,
            },
        },
        createdAt: nowTimestamp.toString(),
        expiresAt: expiryTimestamp.toString(),
        lastPing: nowTimestamp.toString(),
        
    });

    const member = await message.guild?.members.fetch(user.id).catch(() => null);
    if (member) {
      await member.roles.add(sellerRole).catch(() => null);
    }

    try {
        await user.send({
            content: `🔐 **IMPORTANT: Your Slot Restore Code**\n\nHere is your restore code for the slot in ${message.guild?.name}:\n\`\`\`${restoreCode}\`\`\`\nKeep this code safe and private. It can be used to restore your slot if needed.\n\n**Do not share this code with anyone!**`
        });
    } catch (error) {
        await message.reply(`⚠️ <@${message.author.id}> I couldn't send a DM to ${user.username}. Please ensure they have DMs enabled for this server.`);
    }

    const embed = new EmbedBuilder()
    .setAuthor({ name: `${beautifyString(type)} Slot Information` })
    .setColor(slot.embedColor as ColorResolvable)
    .setDescription(
      `Welcome to your new slot! Please follow these guidelines:\n\n` +
      `• Follow all server rules and regulations\n` +
      `• Always be ready to accept a Middle Man when required`
    )
    .addFields([
      { name: "Purchased At", value: `<t:${nowTimestamp}:F>`, inline: true },
      { name: "Expiry Date", value: template.duration === -1 ? "Lifetime" : `<t:${expiryTimestamp}:F>`, inline: true },
      { name: "Duration", value: template.duration === -1 ? "Lifetime" : `${template.duration} day(s)`, inline: true },
      { name: "Available Pings", value: `\`@here\`: ${template.pings.here}\n\`@everyone\`: ${template.pings.everyone}`, inline: false },
    ])
    .setFooter({ text: `Slot ID: ${channel.id} • Developed by @dev_anik` })
    .setTimestamp();
    
    await channel.send({ 
        content: `👋 Welcome <@${user.id}>! Your ${beautifyString(type)} slot has been created successfully. **Check your DMs for your restore code!**`, 
        embeds: [embed] 
    });

    slotLib.updateSlot(user.id, { embeddata: embed.toJSON() });



    
    const sentMessage = await channel.send({
        content: `**📌 IMPORTANT INFORMATION**\n> Please keep this message pinned for future reference.\n> Your restore code has been sent to you via DM.\n> Type \`!help\` to see available commands for your slot.`
    });
    await sentMessage.pin();

    await logPost(
        `Slot created for <@${user.id}> in ${channelMention(channel.id)}\n> **Type:** ${beautifyString(type)}\n> **Expires:** <t:${expiryTimestamp}:F>\n> **Restore code:** \`${restoreCode}\``,
        message.client,
        "Action"
    )

    await msg.edit({
        content: `✅ Slot created successfully for \`${user.username}\`!\n> **Type:** ${beautifyString(type)}\n> **Channel:** ${channelMention(channel.id)}\n> **Expires:** <t:${expiryTimestamp}:R>\n> **Restore code:** Sent via DM`,
        embeds: [],
    });
  },
};

export default CreateSlotCommand;
