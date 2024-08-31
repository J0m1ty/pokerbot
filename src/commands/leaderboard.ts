import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server leaderboard'),
    async execute(interaction) {
    }
}

export default command;