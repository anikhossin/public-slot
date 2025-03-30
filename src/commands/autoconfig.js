"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const AutoConfigCommand = {
    data: {
        name: "autoconfig",
        description: "Automatically configures SlotBot categories, roles, channels, and updates config",
        usage: "autoconfig",
        aliases: ["setup", "configure"],
        category: "Admin",
        permissions: ['Administrator']
    },
    execute: (message, args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const guild = message.guild;
            if (!guild) {
                return message.reply("This command can only be used in a server.");
            }
            const configEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("SlotBot Auto Configuration")
                .setDescription("Starting configuration process...")
                .setColor("#3498db")
                .setTimestamp();
            const statusMessage = yield message.reply({ embeds: [configEmbed] });
            let sellerRole = guild.roles.cache.find((role) => role.name === "Seller") || null;
            if (!sellerRole) {
                sellerRole = yield guild.roles.create({
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
            }
            else {
                configEmbed.addFields({
                    name: "Seller Role",
                    value: "Found existing role ✅",
                    inline: true,
                });
            }
            let logChannel = guild.channels.cache.find((channel) => channel.name === "slot-logs" && channel.type === discord_js_1.ChannelType.GuildText);
            if (!logChannel) {
                logChannel = yield guild.channels.create({
                    name: "slot-logs",
                    type: discord_js_1.ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [discord_js_1.PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: sellerRole.id,
                            allow: [discord_js_1.PermissionFlagsBits.ViewChannel],
                        },
                    ],
                    reason: "SlotBot auto configuration - Log channel",
                });
                configEmbed.addFields({
                    name: "Log Channel",
                    value: "Created successfully ✅",
                    inline: true,
                });
            }
            else {
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
            const categories = {};
            for (let i = 0; i < categoryNames.length; i++) {
                const categoryName = categoryNames[i];
                let category = guild.channels.cache.find((channel) => channel.name === categoryName &&
                    channel.type === discord_js_1.ChannelType.GuildCategory);
                if (!category) {
                    category = yield guild.channels.create({
                        name: categoryName,
                        type: discord_js_1.ChannelType.GuildCategory,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                allow: [discord_js_1.PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: sellerRole.id,
                                allow: [
                                    discord_js_1.PermissionFlagsBits.ManageChannels,
                                    discord_js_1.PermissionFlagsBits.ManageMessages,
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
            const config = JSON.parse(configFile);
            config.slot.categories = categories;
            config.slot.sellerRole = sellerRole.id;
            config.slot.logChannel = logChannel.id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf8");
            configEmbed.addFields({
                name: "Config File",
                value: "Updated successfully ✅",
                inline: true,
            });
            configEmbed.setDescription("SlotBot configuration complete! The bot will restart to apply changes.");
            yield statusMessage.edit({ embeds: [configEmbed] });
            yield message.reply("Restart the bot to apply the changes.");
        }
        catch (error) {
            console.error(`Error in autoconfig command:`, error);
            yield message.reply("An error occurred during auto-configuration. Please check the logs for details.");
        }
    }),
};
exports.default = AutoConfigCommand;
//# sourceMappingURL=autoconfig.js.map