import { Event } from "../structures.js";
import { generate } from "../commands/learn.js";

const event: Event = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('learn-')) return;

        const game = interaction.customId.split('-')[1];
        const step = parseInt(interaction.customId.split('-')[2]) + 1;
        await generate(interaction, { game, step });
    }
}

export default event;