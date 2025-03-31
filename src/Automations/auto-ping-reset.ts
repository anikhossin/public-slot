import { Client, TextChannel, userMention } from "discord.js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { loadConfig } from "../libs/others";
import slotLib from "../libs/slot.lib";
import { logPost } from "../libs/logpost";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function AutoPingReset(client: Client) {
  try {
    const config = loadConfig();
    if (!config) {
      console.error("[AutoPingReset] Config not found.");
      return;
    }
    const { pingResetTime } = config.slot;
    const { time, timezone } = pingResetTime;

    const currentTime = dayjs().tz(timezone);

    const [hours, minutes] = time.split(":").map(Number);
    const targetTime = currentTime
      .clone()
      .hour(hours)
      .minute(minutes)
      .second(0);

    if (
      currentTime.hour() === targetTime.hour() &&
      currentTime.minute() === targetTime.minute()
    ) {
      slotLib.resetAllPings();
      const slots = slotLib.getAllSlots();
      for (const i of slots) {
        const channel = (await client.channels.fetch(
          i.channelid
        )) as TextChannel;
        if (channel) {
          await channel.send(
            `${userMention(i.userId)} Your ping has been reset.`
          );
        }
      }
      console.log("[AutoPingReset] All pings have been reset.");
      await logPost("All pings have been reset.", client, "Action");
    }
  } catch (error) {
    console.error("[AutoPingReset] Error:", error);
  }
}
