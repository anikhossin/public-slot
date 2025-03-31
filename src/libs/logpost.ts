import { Client, ColorResolvable, EmbedBuilder, TextChannel } from 'discord.js';
import { bot, slot } from "../../config.json";

type LogType = 'Info' | 'Warning' | 'Error' | 'Action'

export async function logPost(message: string, client: Client, type: LogType ): Promise<void> {
    const logChannelId =  await client.channels.fetch(slot.logChannel).catch(() => null) as TextChannel;
    if (!logChannelId) {
        console.error('Log channel not found.');
        return;
    }   
    const emojis = {
        Info: 'ℹ️',
        Warning: '⚠️',
        Error: '❌',
        Action: '✅'
    }
    const embed = new EmbedBuilder()
    .setTitle(`${emojis[type]} ${type} Log`)
    .setDescription(message)
    .setColor(slot.embedColor as ColorResolvable)
    .setTimestamp()
    .setFooter({ text: `Developed by @dev_anik` });
    await logChannelId.send({ embeds: [embed] }).catch((error) => {
        console.error('Failed to send log message:', error);
    });
}