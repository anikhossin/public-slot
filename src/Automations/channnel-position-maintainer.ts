import { Client, Collection, GuildChannel } from "discord.js";
import slotLib from "../libs/slot.lib";
import { logPost } from "../libs/logpost";
import { ISlot } from "../types/Slot";

export default async function channelPositionMaintainer(client: Client) {
  try {
    const slots = slotLib.getAllSlots();

    const filteredSlots = slots.filter(
      (slot) => slot.status === "active" || slot.status === "about_to_expire"
    );

    const slotsByCategory: Record<string, ISlot[]> = {};

    const channelsCache = new Collection<string, GuildChannel>();

    for (const slot of filteredSlots) {
      try {
        const channel = (await client.channels.fetch(
          slot.channelid
        )) as GuildChannel;

        if (channel && channel.parentId) {
          channelsCache.set(channel.id, channel);

          if (!slotsByCategory[channel.parentId]) {
            slotsByCategory[channel.parentId] = [];
          }

          slotsByCategory[channel.parentId].push(slot);
        }
      } catch (error) {
        console.error(`Channel not found for slot ${slot.userId}:`, error);
        continue;
      }
    }

    for (const [categoryId, categorySlots] of Object.entries(slotsByCategory)) {
      // Sort slots by priority rules:
      // 1. Lifetime slots (-1) get highest priority
      // 2. Longer duration gets higher priority
      // 3. If same duration, older slot gets higher priority
      const sortedSlots = categorySlots.sort((a, b) => {
        // Lifetime slots (-1) get highest priority
        if (a.duration === -1 && b.duration !== -1) return -1;
        if (a.duration !== -1 && b.duration === -1) return 1;

        // If both are lifetime or both are not, compare durations
        if (a.duration !== b.duration) {
          return b.duration - a.duration;
        }

        // Same duration, sort by creation date (older = higher position)
        const aCreatedAt = parseInt(a.createdAt);
        const bCreatedAt = parseInt(b.createdAt);
        return aCreatedAt - bCreatedAt;
      });

      const positionUpdates: { channel: GuildChannel; position: number }[] = [];

      sortedSlots.forEach((slot, index) => {
        const channel = channelsCache.get(slot.channelid);

        if (channel) {
          if (channel.position !== index) {
            positionUpdates.push({
              channel,
              position: index,
            });
          }
        }
      });

      if (positionUpdates.length > 0) {
        try {
          await Promise.all(
            positionUpdates.map((update) =>
              update.channel.setPosition(update.position)
            )
          );

          await logPost(
            `Updated positions for ${positionUpdates.length} channels in category ${categoryId}`,
            client,
            "Info"
          );
        } catch (error) {
          console.error(
            `Failed to update channel positions in category ${categoryId}:`,
            error
          );
        }
      }
    }
  } catch (error) {
    console.error("Error in channelPositionMaintainer:", error);
  }
}
