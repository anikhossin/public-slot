import { Message } from 'discord.js';
import { PrefixCommand } from '../types/command';
import { getHelpEmbed, buildInteractiveHelpEmbed } from '../Handlers/commandLoader';

const HelpCommand: PrefixCommand = {
  data: {
    name: 'help',
    description: 'Lists all available commands or shows information about a specific command',
    usage: 'help [command]',
    aliases: ['commands', 'h'],
    category: 'Utils',
  },
  execute: async (message: Message, args: string[]) => {
    try {
      if (args.length === 0) {
        await buildInteractiveHelpEmbed(message);
      } else {
        const commandName = args[0].toLowerCase();
        const helpEmbed = getHelpEmbed(commandName);
        await message.reply({ embeds: [helpEmbed] });
      }
    } catch (error) {
      console.error(`Error sending help message: ${error}`);
      await message.reply('There was an error displaying the help information.');
    }
  },
};

export default HelpCommand;