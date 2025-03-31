import { Client } from "discord.js";
import slotLib from "../libs/slot.lib";
import dayjs from "dayjs";
import { loadConfig } from "../libs/others";

export async function makeExpired(client: Client) {
    try {
        const slots = slotLib.getAllSlots();
        const config = loadConfig();
        if (!config) {
            console.error("[makeExpired] Config not found.");
            return;
        }

        const currentTime = dayjs().unix();
        
        for (const slot of slots) {
            const expiresAt = dayjs(Number(slot.expiresAt) * 1000).unix();
            if (currentTime >= expiresAt)  {
                
            }
        }



    } catch (error) {
        console.error("[makeExpired] Error:", error);
    }
}