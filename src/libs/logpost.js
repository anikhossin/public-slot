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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPost = logPost;
const discord_js_1 = require("discord.js");
const config_json_1 = require("../../config.json");
function logPost(message, client, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const logChannelId = yield client.channels.fetch(config_json_1.slot.logChannel).catch(() => null);
        if (!logChannelId) {
            console.error('Log channel not found.');
            return;
        }
        const emojis = {
            Info: 'ℹ️',
            Warning: '⚠️',
            Error: '❌',
            Action: '✅'
        };
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`${emojis[type]} ${type} Log`)
            .setDescription(message)
            .setColor(config_json_1.slot.embedColor)
            .setTimestamp()
            .setFooter({ text: `Developed by @dev_anik` });
        yield logChannelId.send({ embeds: [embed] }).catch((error) => {
            console.error('Failed to send log message:', error);
        });
    });
}
//# sourceMappingURL=logpost.js.map