import * as fs from 'fs';
import * as path from 'path';
import { PrefixCommand } from '../types/command';
import { 
    EmbedBuilder, 
    ColorResolvable, 
    Client, 
    Message, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder,
    ComponentType,
    StringSelectMenuInteraction
} from 'discord.js';
import { bot, slot } from "../../config.json";

const Help: PrefixCommand[] = [];
const failedCommands: { name: string; error: Error }[] = [];
const commandDir = path.join(__dirname, '..', 'commands');

export const loadCommands = (): Map<string, PrefixCommand> => {
    const commands = new Map<string, PrefixCommand>();

    const readCommandsRecursively = (dir: string) => {
        const en = fs.readdirSync(dir);

        for (const entry of en) {
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                readCommandsRecursively(fullPath);
            } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
                try {
                    const cmd: PrefixCommand = require(fullPath).default;
                    commands.set(cmd.data.name, cmd);
                    Help.push(cmd);
                    console.log(`✅ Loaded command: ${cmd.data.name}`);
                } catch (error) {
                    const commandName = path.basename(entry, path.extname(entry));
                    failedCommands.push({ name: commandName, error: error as Error });
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
    } catch (error) {
        console.error(`Error loading commands: ${error}`);
    }
    
    return commands;
};

const commands = loadCommands();

export async function buildInteractiveHelpEmbed(message: Message): Promise<void> {
    const prefix = bot.prefix;
    
    const mainHelpEmbed = new EmbedBuilder()
        .setColor(slot.embedColor as ColorResolvable)
        .setTitle('Command Help System')
        .setDescription(`Welcome to the SlotBot help system!\nUse the dropdown menu below to browse commands by category.\nOr use \`${prefix}help [command]\` for specific command information.`)
        .setTimestamp()
        .setFooter({ text: 'SlotBot Help System' });
    
    const categories = Array.from(new Set(Help.map(cmd => cmd.data.category))).sort();
    
    const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('help-category')
            .setPlaceholder('Select a command category')
            .addOptions(
                categories.map(category => 
                    new StringSelectMenuOptionBuilder()
                        .setLabel(category)
                        .setValue(category)
                        .setDescription(`${category} commands`)
                        .setEmoji('🔧')
                )
            )
    );
    
    const reply = await message.reply({
        embeds: [mainHelpEmbed],
        components: [selectMenu]
    });
    
    const collector = reply.createMessageComponentCollector({ 
        componentType: ComponentType.StringSelect,
        time: 300000 
    });
    
    collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
        try {
            await interaction.deferUpdate();
            
            const selectedCategory = interaction.values[0];
            const commandsInCategory = Help.filter(cmd => cmd.data.category === selectedCategory);
            
            let description = '';
            commandsInCategory.forEach(cmd => {
                description += `**\`${prefix}${cmd.data.name}\`** - ${cmd.data.description}\n`;
            });
            
            const categoryEmbed = new EmbedBuilder()
                .setColor(slot.embedColor as ColorResolvable)
                .setTitle(`${selectedCategory} Commands`)
                .setDescription(description || 'No commands in this category.')
                .setFooter({ text: `Use ${prefix}help [command] for more details on a specific command` });
                
            await interaction.editReply({ embeds: [categoryEmbed], components: [selectMenu] });
        } catch (error) {
            console.error('Error handling help select menu interaction:', error);
        }
    });
    
    collector.on('end', () => {
        reply.edit({ components: [] }).catch(() => null);
    });
}

function buildHelpEmbed() {
    const prefix = bot.prefix;
    const commandCategories = new Set<string>();
    
    Help.forEach(cmd => {
        commandCategories.add(cmd.data.category);
    });
    const sortedCategories = Array.from(commandCategories).sort();
    const categoryCommands = new Map<string, PrefixCommand[]>();
    sortedCategories.forEach(category => {
        const commandsInCategory = Help.filter(cmd => cmd.data.category === category);
        categoryCommands.set(category, commandsInCategory);
    });
    
    const embed = new EmbedBuilder()
        .setColor(slot.embedColor as ColorResolvable)
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

export function getHelpEmbed(commandName?: string): EmbedBuilder {
    if (!commandName) {
        return buildHelpEmbed();
    }

    const command = commands.get(commandName) || 
                   [...commands.values()].find(cmd => cmd.data.aliases?.includes(commandName));

    if (!command) {
        const embed = new EmbedBuilder()
            .setColor(slot.embedColor as ColorResolvable)
            .setTitle('Command Not Found')
            .setDescription(`The command \`${commandName}\` does not exist.`)
            .setFooter({ text: 'Use the help command without arguments to see all available commands.' });
        return embed;
    }

    const embed = new EmbedBuilder()
        .setColor(slot.embedColor as ColorResolvable)
        .setTitle(`Command: ${command.data.name}`)
        .setDescription(command.data.description)
        .addFields(
            { name: 'Category', value: command.data.category, inline: true },
            { name: 'Usage', value: `\`${bot.prefix}${command.data.usage}\``, inline: true }
        );

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

const cooldowns = new Map<string, number>();
export function checkCooldown(commandName: string, userId: string): boolean {
    const now = Date.now();
    const cooldownKey = `${commandName}-${userId}`;
    const cooldown = cooldowns.get(cooldownKey);
    if (cooldown) {
        const remainingTime = cooldown - now;
        if (remainingTime > 0) {
            return false;
        }
    }
    cooldowns.set(cooldownKey, now + (commands.get(commandName)?.data.cooldown || 0) * 1000);
    return true; 
}

export function getRemainingCooldown(commandName: string, userId: string): number {
    const now = Date.now();
    const cooldownKey = `${commandName}-${userId}`;
    const cooldown = cooldowns.get(cooldownKey);
    
    if (!cooldown) return 0;
    
    const remainingTime = cooldown - now;
    return remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0;
}

export function setupCommandHandler(client: Client): void {
    client.on('messageCreate', async (message: Message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith(bot.prefix)) return;
        
        const args = message.content.slice(bot.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        
        if (!commandName) return;
        
        if (commandName === 'help' && !args.length) {
            await buildInteractiveHelpEmbed(message);
            return;
        }
        
        const command = commands.get(commandName) || 
                        [...commands.values()].find(cmd => cmd.data.aliases?.includes(commandName));
        
        if (!command) return;
        
        if (command.data.permissions && command.data.permissions.length > 0) {
            const memberPermissions = message.member?.permissions;
            
            if (!memberPermissions) {
                await message.reply('Unable to verify your permissions.');
                return;
            }
            
            const hasPermission = command.data.permissions.every(permission => 
                memberPermissions.has(permission)
            );
            
            if (!hasPermission) {
                await message.reply('You do not have permission to use this command.');
                return;
            }
        }

        if (command.data.cooldown && !checkCooldown(commandName, message.author.id)) {
            const remainingTime = getRemainingCooldown(commandName, message.author.id);
            await message.reply(`Please wait ${remainingTime.toFixed(2)} seconds before using this command again.`);
            return;
        }
        
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            await message.reply('There was an error executing that command!');
        }
    });
}

export { commands, Help };