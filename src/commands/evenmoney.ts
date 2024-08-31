import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('evenmoney')
        .setDescription('Take even money on a blackjack when the dealer shows an Ace'),
    async execute(interaction) {
    }
}

export default command;