import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Message,
  Partials,
  TextChannel,
} from "discord.js";
import { bot } from "../config.json";
import { setupCommandHandler } from "./Handlers/commandLoader";
import { loadConfig } from "./libs/others";
import slotLib from "./libs/slot.lib";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
  console.log(`Serving in ${client.guilds.cache.size} servers`);

  client.user?.setActivity(`${bot.prefix}help`, { type: 0 });
});

setupCommandHandler(client);

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  if (message.channel.type !== ChannelType.GuildText) return;

  const channel = message.channel as TextChannel;
  
  const config = loadConfig();
  if (!config) {
    console.error("Config not found. Please contact the admin.");
    return;
  }
  
  const slot = config.slot;
  const categories = Object.values(slot.categories);
  if (!channel?.parentId || !categories.includes(channel.parentId)) {
    console.error(
      `Channel ID ${message.channel.id} is not in the configured categories.`
    );
    return;
  }

  const userSlot = slotLib.getSlotByChannelId(message.channel.id);
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
    await handlePing(message, userSlot, hasPingHere ? "here" : "everyone");
  } else {
    await message.channel.send("### Always use Middle Man");
  }
});

async function handlePing(message: Message, userSlot: any, pingType: "here" | "everyone") {
  if (pingType === "here") {
    slotLib.addherePing(userSlot.userId);
  } else {
    slotLib.addeveryonePing(userSlot.userId);
  }
  
  const updatedSlot = slotLib.getSlotByUserId(userSlot.userId);
  if (!updatedSlot) {
    console.error(`Slot not found for user ID: ${userSlot.userId}`);
    await message.reply("Error processing your ping. Please contact an admin.");
    return;
  }
  
  const pingData = pingType === "here" ? updatedSlot.pings.here : updatedSlot.pings.everyone;
  const isExceeded = pingData.current > pingData.max;
  const remaining = pingData.max - pingData.current;
  
  if (isExceeded) {
    await message.reply(
      `You have exceeded the maximum allowed ${pingType} pings for this slot. **This slot is now revoked by system automation.**`
    );
    return;
  }
  
  await (message.channel as TextChannel).send("### Always use Middle Man");
  await message.reply(`You have \`${remaining} ${pingType}\` pings left.`);
}

client.login(bot.token).catch((error) => {
  console.error("Failed to login:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
