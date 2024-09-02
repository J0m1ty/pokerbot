import { Event, Verification } from "../structures.js";
import { client } from "../client.js";
import { generate } from "../commands/learn.js";
import { ROLE } from "../config/discord.js";

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