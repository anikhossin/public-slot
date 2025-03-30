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
const config_json_1 = require("../config.json");
const commandLoader_1 = require("./Handlers/commandLoader");
const others_1 = require("./libs/others");
const slot_lib_1 = __importDefault(require("./libs/slot.lib"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
    partials: [
        discord_js_1.Partials.Channel,
        discord_js_1.Partials.Message,
        discord_js_1.Partials.User,
        discord_js_1.Partials.GuildMember,
    ],
});
client.once("ready", () => {
    var _a, _b;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
    console.log(`Serving in ${client.guilds.cache.size} servers`);
    (_b = client.user) === null || _b === void 0 ? void 0 : _b.setActivity(`${config_json_1.bot.prefix}help`, { type: 0 });
});
(0, commandLoader_1.setupCommandHandler)(client);
client.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (message.author.bot)
        return;
    if (message.channel.type !== discord_js_1.ChannelType.GuildText)
        return;
    const channel = message.channel;
    const config = (0, others_1.loadConfig)();
    if (!config) {
        console.error("Config not found. Please contact the admin.");
        return;
    }
    const slot = config.slot;
    const categories = Object.values(slot.categories);
    if (!(channel === null || channel === void 0 ? void 0 : channel.parentId) || !categories.includes(channel.parentId)) {
        console.error(`Channel ID ${message.channel.id} is not in the configured categories.`);
        return;
    }
    const userSlot = slot_lib_1.default.getSlotByChannelId(message.channel.id);
    if (!userSlot) {
        console.error(`Slot not found for channel ID: ${message.channel.id}`);
        return;
    }
    if (userSlot.userId !== message.author.id) {
        return;
    }
    const hasPingHere = message.content.includes("@here");
    const hasPingEveryone = message.content.includes("@everyone");
    if (hasPingHere || hasPingEveryone) {
        yield handlePing(message, userSlot, hasPingHere ? "here" : "everyone");
    }
    else {
        yield message.channel.send("### Always use Middle Man");
    }
}));
function handlePing(message, userSlot, pingType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (pingType === "here") {
            slot_lib_1.default.addherePing(userSlot.userId);
        }
        else {
            slot_lib_1.default.addeveryonePing(userSlot.userId);
        }
        const updatedSlot = slot_lib_1.default.getSlotByUserId(userSlot.userId);
        if (!updatedSlot) {
            console.error(`Slot not found for user ID: ${userSlot.userId}`);
            yield message.reply("Error processing your ping. Please contact an admin.");
            return;
        }
        const pingData = pingType === "here" ? updatedSlot.pings.here : updatedSlot.pings.everyone;
        const isExceeded = pingData.current > pingData.max;
        const remaining = pingData.max - pingData.current;
        if (isExceeded) {
            yield message.reply(`You have exceeded the maximum allowed ${pingType} pings for this slot. **This slot is now revoked by system automation.**`);
            return;
        }
        yield message.channel.send("### Always use Middle Man");
        yield message.reply(`You have \`${remaining} ${pingType}\` pings left.`);
    });
}
client.login(config_json_1.bot.token).catch((error) => {
    console.error("Failed to login:", error);
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
});
//# sourceMappingURL=index.js.map