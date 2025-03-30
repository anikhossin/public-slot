"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const others_1 = require("../libs/others");
const slot_lib_1 = __importDefault(require("../libs/slot.lib"));
const dayjs_1 = __importDefault(require("dayjs"));
const logpost_1 = require("../libs/logpost");
const CreateSlotCommand = {
    data: {
        name: "create-slot",
        description: "Create a new slot",
        usage: "create-slot <@user> <category number> <type>",
        aliases: ["create", "new-slot", "cs"],
        category: "Admin",
        permissions: ["Administrator"],
    },
    execute: (message, args) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const user = message.mentions.users.first();
        if (!user) {
            return yield message.reply("Invalid usage! Try `create-slot <@user> <category number> <type>`");
        }
        const categoryNumber = args[1];
        const type = args[2];
        if (!categoryNumber || !type) {
            return yield message.reply("Invalid usage! Try `create-slot <@user> <category number> <type>`");
        }
        const config = (0, others_1.loadConfig)();
        if (!config) {
            return yield message.reply("Config not found. Please contact the admin.");
        }
        const slot = config.slot;
        if (!slot.categories[categoryNumber]) {
            const availableCategories = Object.keys(slot.categories).join(", ");
            return yield message.reply(`Invalid category number! Please use one of the following: ${availableCategories}`);
        }
        const categoryId = slot.categories[categoryNumber];
        const validTypes = Object.keys(slot.templates);
        if (!validTypes.includes(type)) {
            return yield message.reply("Invalid type! Please use one of the following types: " +
                validTypes.join(", "));
        }
        const template = slot.templates[type];
        if (!template) {
            return yield message.reply("Template not found. Please check the type.");
        }
        const userslot = slot_lib_1.default.getSlotByUserId(user.id);
        if (userslot) {
            return yield message.reply(`User already has a slot ${(0, discord_js_1.channelMention)(userslot.channelid)}. Please delete it first.`);
        }
        const msg = yield message.reply(`Creating slot for \`${user.username}\` in category ${categoryNumber} (ID: ${categoryId}) with type ${type}.`);
        const category = (yield ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.channels.fetch(categoryId).catch(() => null)));
        const sellerRole = yield ((_b = message.guild) === null || _b === void 0 ? void 0 : _b.roles.fetch(slot.sellerRole).catch(() => null));
        if (!category || !sellerRole) {
            return yield message.reply("Category or seller role not found. Please contact the admin tp check `config.json`.");
        }
        if (category.children.cache.size >= 50) {
            return yield message.reply("Category is full! Try other category");
        }
        const channel = yield ((_c = message.guild) === null || _c === void 0 ? void 0 : _c.channels.create({
            name: `・❥・${user.username}`,
            type: discord_js_1.ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: (_d = message.guild) === null || _d === void 0 ? void 0 : _d.roles.everyone.id,
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
        }));
        if (!channel) {
            return yield message.reply("Failed to create channel. Please try again.");
        }
        // Using dayjs for better date handling
        const now = (0, dayjs_1.default)();
        const expiryDate = now.add(template.duration, 'day');
        // Convert to Unix timestamps (seconds)
        const nowTimestamp = now.unix();
        const expiryTimestamp = expiryDate.unix();
        const restoreCode = (0, others_1.getRandomCode)();
        slot_lib_1.default.addSlot({
            userId: user.id,
            channelid: channel.id,
            restoreCode: restoreCode,
            status: "active",
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
        try {
            yield user.send({
                content: `🔐 **IMPORTANT: Your Slot Restore Code**\n\nHere is your restore code for the slot in ${(_e = message.guild) === null || _e === void 0 ? void 0 : _e.name}:\n\`\`\`${restoreCode}\`\`\`\nKeep this code safe and private. It can be used to restore your slot if needed.\n\n**Do not share this code with anyone!**`
            });
        }
        catch (error) {
            yield message.reply(`⚠️ <@${message.author.id}> I couldn't send a DM to ${user.username}. Please ensure they have DMs enabled for this server.`);
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setAuthor({ name: `${(0, others_1.beautifyString)(type)} Slot` })
            .setColor(slot.embedColor)
            .setDescription(`- Follow all the rules and regulations of the server.\n` +
            `- Always ready to accept Middle Man`)
            .addFields([
            { name: "📅 Purchased At", value: `<t:${nowTimestamp}:F>`, inline: true },
            { name: "⏳ Expiry Date", value: `<t:${expiryTimestamp}:F>`, inline: true },
            { name: "⌛ Duration", value: `${template.duration} day(s)`, inline: true },
            { name: "🔔 Available Pings", value: `\`@here\`: ${template.pings.here}\n\`@everyone\`: ${template.pings.everyone}`, inline: false },
        ])
            .setFooter({ text: `Slot ID: ${channel.id} • Developed by @dev_anik` })
            .setTimestamp();
        yield channel.send({
            content: `👋 Welcome <@${user.id}>! Your ${(0, others_1.beautifyString)(type)} slot has been created successfully. **Check your DMs for your restore code!**`,
            embeds: [embed]
        });
        const sentMessage = yield channel.send({
            content: `**📌 IMPORTANT INFORMATION**\n> Please keep this message pinned for future reference.\n> Your restore code has been sent to you via DM.\n> Type \`!help\` to see available commands for your slot.`
        });
        yield sentMessage.pin();
        yield (0, logpost_1.logPost)(`Slot created for <@${user.id}> in ${(0, discord_js_1.channelMention)(channel.id)}\n> **Type:** ${(0, others_1.beautifyString)(type)}\n> **Expires:** <t:${expiryTimestamp}:F>\n> **Restore code:** \`${restoreCode}\``, message.client, "Action");
        yield msg.edit({
            content: `✅ Slot created successfully for \`${user.username}\`!\n> **Type:** ${(0, others_1.beautifyString)(type)}\n> **Channel:** ${(0, discord_js_1.channelMention)(channel.id)}\n> **Expires:** <t:${expiryTimestamp}:R>\n> **Restore code:** Sent via DM`,
            embeds: [],
        });
    }),
};
exports.default = CreateSlotCommand;
//# sourceMappingURL=create.js.map