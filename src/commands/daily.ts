import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    async execute(interaction) {
    }
}

export default command;