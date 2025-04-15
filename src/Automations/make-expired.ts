import { Client, TextChannel } from "discord.js";
import slotLib from "../libs/slot.lib";
import dayjs from "dayjs";
import { loadConfig } from "../libs/others";
import { logPost } from "../libs/logpost";

export async function makeExpired(client: Client) {
  try {
    const allslots = slotLib.getAllSlots();
    const slots = allslots.filter(slot => slot.duration > 0);
    const config = loadConfig();
    if (!config) {
      console.error("[makeExpired] Config not found.");
      return;
    }

    const currentTime = dayjs().unix();

    for (const slot of slots) {
      const expiresAt = dayjs(Number(slot.expiresAt) * 1000).unix();
      if (currentTime >= expiresAt) {
        const channel = (await client.channels
          .fetch(slot.channelid)
          .catch(() => null)) as TextChannel;
        if (channel) {
          await channel.delete().catch(err => {
            console.error(`[makeExpired] Failed to delete channel for user ${slot.userId}:`, err);
          });
          slotLib.deleteSlot(slot.userId);
          await logPost(
            `<@${slot.userId}> Your slot has expired and the channel has been deleted.`,
            client,
            "Action"
          );
        } else {
          console.log(`[makeExpired] Channel not found for expired slot of user ${slot.userId}. Cleaning up slot record.`);
          slotLib.deleteSlot(slot.userId);
        }
      }
    }
  } catch (error) {
    console.error("[makeExpired] Error:", error);
  }
}
