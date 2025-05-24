import { EmbedBuilder, Message, time } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import FlexSearch from "flexsearch";
import dayjs from "dayjs";
import { getColor } from "../libs/others";
import { ISlot } from "../types/Slot";

interface SearchResult {
    slot: ISlot;
    matchedProducts: string[];
}

function sortSlotsByPriority(slots: ISlot[]): ISlot[] {
    return slots.sort((a, b) => {
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
}

async function searchProducts(query: string): Promise<SearchResult[]> {
    const slots = slotLib.getAllSlots();
    const activeSlots = slots.filter(slot =>
        slot.status === "active" || slot.status === "about_to_expire"
    );

    if (!query || query.trim() === "") {
        // If no query, return all active slots sorted by priority
        const sortedSlots = sortSlotsByPriority(activeSlots);
        return sortedSlots.map(slot => ({
            slot,
            matchedProducts: slot.products
        }));
    }

    // Create FlexSearch index for products
    const index = new FlexSearch.Index({
        tokenize: "forward",
        resolution: 9
    });

    const productSlotMap = new Map<number, { slot: ISlot; product: string }>();
    let productId = 0;

    // Index all products
    for (const slot of activeSlots) {
        for (const product of slot.products) {
            index.add(productId, product);
            productSlotMap.set(productId, { slot, product });
            productId++;
        }
    }

    // Search for products
    const searchResults = index.search(query.toLowerCase());
    const resultMap = new Map<string, SearchResult>();

    for (const id of searchResults) {
        const result = productSlotMap.get(id as number);
        if (result) {
            const key = result.slot.userId;
            if (resultMap.has(key)) {
                resultMap.get(key)!.matchedProducts.push(result.product);
            } else {
                resultMap.set(key, {
                    slot: result.slot,
                    matchedProducts: [result.product]
                });
            }
        }
    }

    // Sort results by slot priority
    const sortedResults = Array.from(resultMap.values());
    sortedResults.sort((a, b) => {
        // Apply same sorting logic as channel position maintainer
        if (a.slot.duration === -1 && b.slot.duration !== -1) return -1;
        if (a.slot.duration !== -1 && b.slot.duration === -1) return 1;
        if (a.slot.duration !== b.slot.duration) {
            return b.slot.duration - a.slot.duration;
        }
        const aCreatedAt = parseInt(a.slot.createdAt);
        const bCreatedAt = parseInt(b.slot.createdAt);
        return aCreatedAt - bCreatedAt;
    });

    return sortedResults;
}

const SearchCommand: PrefixCommand = {
    data: {
        name: "search",
        description: "Search for products in active slots or list all slots sorted by priority",
        usage: "search [product name]",
        aliases: ["find", "s"],
        category: "Utils"
    },
    execute: async (msg: Message, args: string[]) => {
        const query = args.join(" ").trim();

        try {
            const results = await searchProducts(query);

            if (results.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("🔍 Search Results")
                    .setDescription(query
                        ? `No products found matching "${query}"`
                        : "No active slots found"
                    )
                    .setColor(getColor())
                    .setTimestamp();

                return await msg.reply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle("🔍 Search Results")
                .setDescription(query
                    ? `Found ${results.length} slot(s) with products matching "${query}"`
                    : `All active slots (${results.length} total) - sorted by priority`
                )
                .setColor(getColor())
                .setTimestamp();

            // Add fields for each result (limit to 10 to avoid embed limits)
            const displayResults = results.slice(0, 10);

            for (let i = 0; i < displayResults.length; i++) {
                const result = displayResults[i];
                const { slot, matchedProducts } = result;

                const statusEmoji = slot.status === "active" ? "🟢" : "🟡";
                const durationType = slot.duration === -1 ? "Lifetime" : `${slot.duration}d`;
                const expiration = slot.duration === -1
                    ? "Never"
                    : time(dayjs(Number(slot.expiresAt) * 1000).unix(), "R");

                const products = query
                    ? matchedProducts.slice(0, 3).join(", ") + (matchedProducts.length > 3 ? "..." : "")
                    : slot.products.slice(0, 3).join(", ") + (slot.products.length > 3 ? "..." : "");

                embed.addFields([{
                    name: `${i + 1}. ${statusEmoji} <#${slot.channelid}>`,
                    value: `**Duration:** ${durationType}\n**Expires:** ${expiration}\n**Products:** ${products || "None"}`,
                    inline: false
                }]);
            }

            if (results.length > 10) {
                embed.setFooter({
                    text: `Showing first 10 of ${results.length} results • Requested by ${msg.author.tag}`,
                    iconURL: msg.author.displayAvatarURL() || ""
                });
            } else {
                embed.setFooter({
                    text: `Requested by ${msg.author.tag}`,
                    iconURL: msg.author.displayAvatarURL() || ""
                });
            }

            await msg.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in search command:", error);
            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("An error occurred while searching. Please try again.")
                .setColor("#ff0000")
                .setTimestamp();

            await msg.reply({ embeds: [embed] });
        }
    }
};

export default SearchCommand;