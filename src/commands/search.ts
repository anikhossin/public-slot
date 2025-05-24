import { EmbedBuilder, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Collection } from "discord.js";
import { PrefixCommand } from "../types/command";
import slotLib from "../libs/slot.lib";
import FlexSearch from "flexsearch";
import { getColor } from "../libs/others";
import { ISlot } from "../types/Slot";

interface SearchResult {
    slot: ISlot;
    matchedProducts: string[];
}

function sortSlotsByPriority(slots: ISlot[]): ISlot[] {
    return slots.sort((a, b) => {
        if (a.duration === -1 && b.duration !== -1) return -1;
        if (a.duration !== -1 && b.duration === -1) return 1;
        if (a.duration !== b.duration) {
            return b.duration - a.duration;
        }
        const aCreatedAt = parseInt(a.createdAt);
        const bCreatedAt = parseInt(b.createdAt);
        return aCreatedAt - bCreatedAt;
    });
}

function expandQueryWithRegex(query: string): string[] {
    const queries = [query];
    const abbreviations: Record<string, string[]> = {
        'nb': ['nitro boost', 'nitro boosts'],
        'nc': ['nitro classic'],
        'ny': ['nitro yearly'],
        'dc': ['discord'],
        'ps': ['playstation'],
        'xbox': ['xbox'],
        'steam': ['steam'],
        'gift': ['gift card', 'giftcard'],
        'gc': ['gift card', 'giftcard'],
        'sub': ['subscription'],
        'acc': ['account'],
        'acct': ['account']
    };
    const lowerQuery = query.toLowerCase().trim();
    if (abbreviations[lowerQuery]) {
        queries.push(...abbreviations[lowerQuery]);
    }
    for (const [abbrev, expansions] of Object.entries(abbreviations)) {
        if (lowerQuery.includes(abbrev)) {
            queries.push(...expansions);
        }
    }
    return [...new Set(queries)];
}

async function searchProducts(query: string): Promise<SearchResult[]> {
    const slots = slotLib.getAllSlots();
    const activeSlots = slots.filter(slot =>
        slot.status === "active" || slot.status === "about_to_expire"
    );
    if (!query || query.trim() === "") {
        const sortedSlots = sortSlotsByPriority(activeSlots);
        return sortedSlots.map(slot => ({
            slot,
            matchedProducts: slot.products
        }));
    }
    const expandedQueries = expandQueryWithRegex(query);
    const index = new FlexSearch.Index({
        tokenize: "forward",
        resolution: 3
    });
    const productSlotMap = new Map<number, { slot: ISlot; product: string }>();
    let productId = 0;
    for (const slot of activeSlots) {
        for (const product of slot.products) {
            index.add(productId, product);
            productSlotMap.set(productId, { slot, product });
            productId++;
        }
    }
    let allSearchResults = new Set<number>();
    for (const searchQuery of expandedQueries) {
        let searchResults = index.search(searchQuery.toLowerCase());
        if (searchResults.length === 0) {
            const manualResults: number[] = [];
            for (const [id, { product }] of productSlotMap) {
                if (product.toLowerCase().includes(searchQuery.toLowerCase())) {
                    manualResults.push(id);
                }
            }
            searchResults = manualResults;
        }
        searchResults.forEach(id => allSearchResults.add(id as number));
    }
    const resultMap = new Map<string, SearchResult>();
    for (const id of allSearchResults) {
        const result = productSlotMap.get(id);
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
    const sortedResults = Array.from(resultMap.values());
    sortedResults.sort((a, b) => {
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

            const itemsPerPage = 10;
            const totalPages = Math.ceil(results.length / itemsPerPage);
            let currentPage = 0;

            const userCache = new Collection<string, string>();
            
            const prioritySlots = results.slice(0, Math.min(20, results.length));
            await Promise.allSettled(
                prioritySlots.map(async (result) => {
                    try {
                        const user = await msg.client.users.fetch(result.slot.userId);
                        userCache.set(result.slot.userId, user.username);
                    } catch (error) {
                        userCache.set(result.slot.userId, `User${result.slot.userId}`);
                    }
                })
            );

            const generateEmbed = async (page: number) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageResults = results.slice(start, end);

                const embed = new EmbedBuilder()
                    .setTitle("🔍 Search Results")
                    .setDescription(query
                        ? `Found ${results.length} slot(s) with products matching "${query}"`
                        : `All active slots (${results.length} total) - sorted by priority`
                    )
                    .setColor(getColor())
                    .setTimestamp();

                const displayLines: string[] = [];
                const userFetchPromises: Promise<void>[] = [];

                for (let i = 0; i < pageResults.length; i++) {
                    const result = pageResults[i];
                    const { slot } = result;
                    
                    if (userCache.has(slot.userId)) {
                        const username = userCache.get(slot.userId)!;
                        displayLines.push(`${start + i + 1}. ${username}: <#${slot.channelid}>`);
                    } else {
                        userFetchPromises.push(
                            msg.client.users.fetch(slot.userId)
                                .then(user => {
                                    userCache.set(slot.userId, user.username);
                                    displayLines[i] = `${start + i + 1}. ${user.username}: <#${slot.channelid}>`;
                                })
                                .catch(() => {
                                    userCache.set(slot.userId, `User${slot.userId}`);
                                    displayLines[i] = `${start + i + 1}. User${slot.userId}: <#${slot.channelid}>`;
                                })
                        );
                        displayLines.push(`${start + i + 1}. User${slot.userId}: <#${slot.channelid}>`);
                    }
                }

                if (userFetchPromises.length > 0) {
                    await Promise.allSettled(userFetchPromises);
                }

                embed.addFields([{
                    name: "Results",
                    value: displayLines.join("\n") || "No results",
                    inline: false
                }]);

                embed.setFooter({
                    text: `Page ${page + 1}/${totalPages} • ${results.length} total results • Requested by ${msg.author.tag}`,
                    iconURL: msg.author.displayAvatarURL() || ""
                });

                return embed;
            };

            const generateButtons = (page: number) => {
                const row = new ActionRowBuilder<ButtonBuilder>();
                
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('◀ Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next ▶')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === totalPages - 1)
                );

                return row;
            };

            const initialEmbed = await generateEmbed(currentPage);
            const components = totalPages > 1 ? [generateButtons(currentPage)] : [];
            
            const response = await msg.reply({ 
                embeds: [initialEmbed], 
                components 
            });

            if (totalPages <= 1) return;

            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 300000
            });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== msg.author.id) {
                    await interaction.reply({
                        content: 'Only the command author can navigate through pages.',
                        ephemeral: true
                    });
                    return;
                }

                if (interaction.customId === 'prev' && currentPage > 0) {
                    currentPage--;
                } else if (interaction.customId === 'next' && currentPage < totalPages - 1) {
                    currentPage++;
                }

                const newEmbed = await generateEmbed(currentPage);
                const newButtons = generateButtons(currentPage);

                await interaction.update({
                    embeds: [newEmbed],
                    components: [newButtons]
                });
            });

            collector.on('end', async () => {
                try {
                    await response.edit({ components: [] });
                } catch (error) {
                }
            });

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