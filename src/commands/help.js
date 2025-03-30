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
const commandLoader_1 = require("../Handlers/commandLoader");
const HelpCommand = {
    data: {
        name: 'help',
        description: 'Lists all available commands or shows information about a specific command',
        usage: 'help [command]',
        aliases: ['commands', 'h'],
        category: 'Utils',
    },
    execute: (message, args) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (args.length === 0) {
                yield (0, commandLoader_1.buildInteractiveHelpEmbed)(message);
            }
            else {
                const commandName = args[0].toLowerCase();
                const helpEmbed = (0, commandLoader_1.getHelpEmbed)(commandName);
                yield message.reply({ embeds: [helpEmbed] });
            }
        }
        catch (error) {
            console.error(`Error sending help message: ${error}`);
            yield message.reply('There was an error displaying the help information.');
        }
    }),
};
exports.default = HelpCommand;
//# sourceMappingURL=help.js.map