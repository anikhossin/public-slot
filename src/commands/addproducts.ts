import slotLib from "../libs/slot.lib";
import { PrefixCommand } from "../types/command";

const AddProductsCommand: PrefixCommand = {
    data: {
        name: "add-products",
        description: "Add products to the store",
        usage: "add-products product1, product2, ...",
        aliases: ["addprod", "ap"],
        category: "Seller",
    },
    execute: async (message, args) => {
        let userslot = slotLib.getSlotByUserId(message.author.id);
        if (!userslot) {
            return await message.reply(":x: You don't have an active slot.");
        }
        if (args.length === 0) {
            return await message.reply("Please provide at least one product to add.");
        }
        const products = args.join(" ").split(",").map(p => p.trim()).filter(p => p.length > 0);
        if (products.length === 0) {
            return await message.reply("No valid products provided.");
        }
        userslot.products.push(...products);
        slotLib.updateSlot(message.author.id, userslot);
        userslot = slotLib.getSlotByUserId(message.author.id); // Refresh the slot data
        if (!userslot) {
            return await message.reply(":x: Failed to update your slot.");
        }
        await message.reply(`:white_check_mark: Products added successfully! Current products: ${userslot.products.join(", ")}`);

    },

}

export default AddProductsCommand;