import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('insurance')
        .setDescription('Place an insurance bet if the dealer shows an Ace'),
    async execute(interaction) {
    }
}

export default command;