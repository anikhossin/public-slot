import slotLib from '../libs/slot.lib';
import { PrefixCommand } from '../types/command';

const RemoveProductsCommand: PrefixCommand = {
    data: {
        name: 'remove-products',
        description: 'Remove products from the store',
        usage: 'remove-products product1, product2, ...',
        aliases: ['removeprod', 'rp'],
        category: 'Seller',
    },
    execute: async (message, args) => {
        const userslot = slotLib.getSlotByUserId(message.author.id);
        if (!userslot) {
            return await message.reply(':x: You don\'t have an active slot.');
        }
        if (args.length === 0) {
            return await message.reply('Please provide at least one product to remove.');
        }
        const productsToRemove = args.join(' ').split(',').map(p => p.trim()).filter(p => p.length > 0);
        if (productsToRemove.length === 0) {
            return await message.reply('No valid products provided.');
        }

        const removedProducts: string[] = [];
        const notFoundProducts: string[] = [];

        productsToRemove.forEach(product => {
            const index = userslot.products.indexOf(product);
            if (index > -1) {
                userslot.products.splice(index, 1);
                removedProducts.push(product);
            } else {
                notFoundProducts.push(product);
            }
        });

        if (removedProducts.length === 0) {
            return await message.reply(':x: None of the specified products were found in your slot.');
        }

        slotLib.updateSlot(message.author.id, userslot);
        const newUserslot = slotLib.getSlotByUserId(message.author.id); // Refresh the slot data
        if (!newUserslot) {
            return await message.reply(':x: Failed to update your slot.');
        }

        let responseMessage = `:white_check_mark: Removed products: ${removedProducts.join(', ')}`;
        if (notFoundProducts.length > 0) {
            responseMessage += `\n:warning: Products not found: ${notFoundProducts.join(', ')}`;
        }
        responseMessage += `\nCurrent products: ${newUserslot.products.length > 0 ? newUserslot.products.join(', ') : 'None'}`;

        await message.reply(responseMessage);
    },
};

export default RemoveProductsCommand;
