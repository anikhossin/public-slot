import {
  Message,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
  ColorResolvable,
  TextChannel,
  CategoryChannel,
  Role,
} from "discord.js";
import { PrefixCommand } from "../types/command";
import * as fs from "fs";
import * as path from "path";
import { IConfigJson } from "../types/Config";

const AutoConfigCommand: PrefixCommand = {
  data: {
    name: "autoconfig",
    description:
      "Automatically configures SlotBot categories, roles, channels, and updates config",
    usage: "autoconfig",
    aliases: ["setup", "configure"],
    category: "Admin",
    permissions: ['Administrator']
  },
  execute: async (message: Message, args: string[]) => {
    try {
      const guild = message.guild;
      if (!guild) {
        return message.reply("This command can only be used in a server.");
      }

      const configEmbed = new EmbedBuilder()
        .setTitle("SlotBot Auto Configuration")
        .setDescription("Starting configuration process...")
        .setColor("#3498db" as ColorResolvable)
        .setTimestamp();

      const statusMessage = await message.reply({ embeds: [configEmbed] });

      let sellerRole: Role | null =
        guild.roles.cache.find((role) => role.name === "Seller") || null;

      if (!sellerRole) {
        sellerRole = await guild.roles.create({
          name: "Seller",
          color: "#e67e22",
          reason: "SlotBot auto configuration - Seller role",
          permissions: [],
        });
        configEmbed.addFields({
          name: "Seller Role",
          value: "Created successfully ✅",
          inline: true,
        });
      } else {
        configEmbed.addFields({
          name: "Seller Role",
          value: "Found existing role ✅",
          inline: true,
        });
      }

      let logChannel: TextChannel | null = guild.channels.cache.find(
        (channel) =>
          channel.name === "slot-logs" && channel.type === ChannelType.GuildText
      ) as TextChannel | null;

      if (!logChannel) {
        logChannel = await guild.channels.create({
          name: "slot-logs",
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: sellerRole.id,
              allow: [PermissionFlagsBits.ViewChannel],
            },
          ],
          reason: "SlotBot auto configuration - Log channel",
        });
        configEmbed.addFields({
          name: "Log Channel",
          value: "Created successfully ✅",
          inline: true,
        });
      } else {
        configEmbed.addFields({
          name: "Log Channel",
          value: "Found existing channel ✅",
          inline: true,
        });
      }

      const categoryNames = [
        "Slots Category 1",
        "Slots Category 2",
        "Slots Category 3",
      ];
      const categories: Record<string, string> = {};

      for (let i = 0; i < categoryNames.length; i++) {
        const categoryName = categoryNames[i];
        let category: CategoryChannel | null = guild.channels.cache.find(
          (channel) =>
            channel.name === categoryName &&
            channel.type === ChannelType.GuildCategory
        ) as CategoryChannel | null;

        if (!category) {
          category = await guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: guild.id,
                allow: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: sellerRole.id,
                allow: [
                  PermissionFlagsBits.ManageChannels,
                  PermissionFlagsBits.ManageMessages,
                ],
              },
            ],
            reason: `SlotBot auto configuration - ${categoryName}`,
          });
        }

        categories[(i + 1).toString()] = category.id;
      }

      configEmbed.addFields({
        name: "Categories",
        value: "Created/Found successfully ✅",
        inline: true,
      });

      const configPath = path.resolve(__dirname, "../../config.json");
      const configFile = fs.readFileSync(configPath, "utf8");
      const config: IConfigJson = JSON.parse(configFile);

      config.slot.categories = categories;
      config.slot.sellerRole = sellerRole.id;
      config.slot.logChannel = logChannel.id;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");

      configEmbed.addFields({
        name: "Config File",
        value: "Updated successfully ✅",
        inline: true,
      });
      configEmbed.setDescription(
        "SlotBot configuration complete! The bot will restart to apply changes."
      );

      await statusMessage.edit({ embeds: [configEmbed] });

      await message.reply("Restart the bot to apply the changes.");
    } catch (error) {
      console.error(`Error in autoconfig command:`, error);
      await message.reply(
        "An error occurred during auto-configuration. Please check the logs for details."
      );
    }
  },
};

export default AutoConfigCommand;
