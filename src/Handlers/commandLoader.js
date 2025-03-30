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
exports.Help = exports.commands = exports.loadCommands = void 0;
exports.buildInteractiveHelpEmbed = buildInteractiveHelpEmbed;
exports.getHelpEmbed = getHelpEmbed;
exports.setupCommandHandler = setupCommandHandler;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const discord_js_1 = require("discord.js");
const config_json_1 = require("../../config.json");
const Help = [];
exports.Help = Help;
const failedCommands = [];
const commandDir = path.join(__dirname, '..', 'commands');
const loadCommands = () => {
    const commands = new Map();
    const readCommandsRecursively = (dir) => {
        const en = fs.readdirSync(dir);
        for (const entry of en) {
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                readCommandsRecursively(fullPath);
            }
            else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
                try {
                    const cmd = require(fullPath).default;
                    commands.set(cmd.data.name, cmd);
                    Help.push(cmd);
                    console.log(`✅ Loaded command: ${cmd.data.name}`);
                }
                catch (error) {
                    const commandName = path.basename(entry, path.extname(entry));
                    failedCommands.push({ name: commandName, error: error });
                    console.error(`❌ Failed to load command ${commandName}: ${error}`);
                }
            }
        }
    };
    try {
        readCommandsRecursively(commandDir);
        console.log(`Loaded ${commands.size} commands successfully.`);
        if (failedCommands.length > 0) {
            console.warn(`Failed to load ${failedCommands.length} commands.`);
            failedCommands.forEach(cmd => {
                console.warn(`- ${cmd.name}: ${cmd.error.message}`);
            });
        }
    }
    catch (error) {
        console.error(`Error loading commands: ${error}`);
    }
    return commands;
};
exports.loadCommands = loadCommands;
const commands = (0, exports.loadCommands)();
exports.commands = commands;
function buildInteractiveHelpEmbed(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const prefix = config_json_1.bot.prefix;
        const mainHelpEmbed = new discord_js_1.EmbedBuilder()
            .setColor(config_json_1.slot.embedColor)
            .setTitle('Command Help System')
            .setDescription(`Welcome to the SlotBot help system!\nUse the dropdown menu below to browse commands by category.\nOr use \`${prefix}help [command]\` for specific command information.`)
            .setTimestamp()
            .setFooter({ text: 'SlotBot Help System' });
        const categories = Array.from(new Set(Help.map(cmd => cmd.data.category))).sort();
        const selectMenu = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId('help-category')
            .setPlaceholder('Select a command category')
            .addOptions(categories.map(category => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(category)
            .setValue(category)
            .setDescription(`${category} commands`)
            .setEmoji('🔧'))));
        const reply = yield message.reply({
            embeds: [mainHelpEmbed],
            components: [selectMenu]
        });
        const collector = reply.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.StringSelect,
            time: 300000
        });
        collector.on('collect', (interaction) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield interaction.deferUpdate();
                const selectedCategory = interaction.values[0];
                const commandsInCategory = Help.filter(cmd => cmd.data.category === selectedCategory);
                let description = '';
                commandsInCategory.forEach(cmd => {
                    description += `**\`${prefix}${cmd.data.name}\`** - ${cmd.data.description}\n`;
                });
                const categoryEmbed = new discord_js_1.EmbedBuilder()
                    .setColor(config_json_1.slot.embedColor)
                    .setTitle(`${selectedCategory} Commands`)
                    .setDescription(description || 'No commands in this category.')
                    .setFooter({ text: `Use ${prefix}help [command] for more details on a specific command` });
                yield interaction.editReply({ embeds: [categoryEmbed], components: [selectMenu] });
            }
            catch (error) {
                console.error('Error handling help select menu interaction:', error);
            }
        }));
        collector.on('end', () => {
            reply.edit({ components: [] }).catch(() => null);
        });
    });
}
function buildHelpEmbed() {
    const prefix = config_json_1.bot.prefix;
    const commandCategories = new Set();
    Help.forEach(cmd => {
        commandCategories.add(cmd.data.category);
    });
    const sortedCategories = Array.from(commandCategories).sort();
    const categoryCommands = new Map();
    sortedCategories.forEach(category => {
        const commandsInCategory = Help.filter(cmd => cmd.data.category === category);
        categoryCommands.set(category, commandsInCategory);
    });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(config_json_1.slot.embedColor)
        .setTitle('Command List')
        .setDescription(`Use \`${prefix}help [command]\` for more information about a specific command.`)
        .setTimestamp()
        .setFooter({ text: 'Bot Help System' });
    sortedCategories.forEach(category => {
        const commands = categoryCommands.get(category);
        if (commands) {
            const commandList = commands
                .map(cmd => `\`${cmd.data.name}\`: ${cmd.data.description}`)
                .join('\n');
            embed.addFields({ name: `${category} Commands`, value: commandList || 'No commands in this category.' });
        }
    });
    return embed;
}
function getHelpEmbed(commandName) {
    if (!commandName) {
        return buildHelpEmbed();
    }
    const command = commands.get(commandName) ||
        [...commands.values()].find(cmd => { var _a; return (_a = cmd.data.aliases) === null || _a === void 0 ? void 0 : _a.includes(commandName); });
    if (!command) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(config_json_1.slot.embedColor)
            .setTitle('Command Not Found')
            .setDescription(`The command \`${commandName}\` does not exist.`)
            .setFooter({ text: 'Use the help command without arguments to see all available commands.' });
        return embed;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(config_json_1.slot.embedColor)
        .setTitle(`Command: ${command.data.name}`)
        .setDescription(command.data.description)
        .addFields({ name: 'Category', value: command.data.category, inline: true }, { name: 'Usage', value: `\`${config_json_1.bot.prefix}${command.data.usage}\``, inline: true });
    if (command.data.aliases && command.data.aliases.length > 0) {
        embed.addFields({ name: 'Aliases', value: command.data.aliases.map(a => `\`${a}\``).join(', '), inline: true });
    }
    if (command.data.cooldown) {
        embed.addFields({ name: 'Cooldown', value: `${command.data.cooldown} seconds`, inline: true });
    }
    if (command.data.permissions && command.data.permissions.length > 0) {
        embed.addFields({
            name: 'Required Permissions',
            value: command.data.permissions.join(', '),
            inline: true
        });
    }
    return embed;
}
function setupCommandHandler(client) {
    client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (message.author.bot)
            return;
        if (!message.content.startsWith(config_json_1.bot.prefix))
            return;
        const args = message.content.slice(config_json_1.bot.prefix.length).trim().split(/ +/);
        const commandName = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (!commandName)
            return;
        if (commandName === 'help' && !args.length) {
            yield buildInteractiveHelpEmbed(message);
            return;
        }
        const command = commands.get(commandName) ||
            [...commands.values()].find(cmd => { var _a; return (_a = cmd.data.aliases) === null || _a === void 0 ? void 0 : _a.includes(commandName); });
        if (!command)
            return;
        if (command.data.permissions && command.data.permissions.length > 0) {
            const memberPermissions = (_b = message.member) === null || _b === void 0 ? void 0 : _b.permissions;
            if (!memberPermissions) {
                yield message.reply('Unable to verify your permissions.');
                return;
            }
            const hasPermission = command.data.permissions.every(permission => memberPermissions.has(permission));
            if (!hasPermission) {
                yield message.reply('You do not have permission to use this command.');
                return;
            }
        }
        try {
            yield command.execute(message, args);
        }
        catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            yield message.reply('There was an error executing that command!');
        }
    }));
}
//# sourceMappingURL=commandLoader.js.map