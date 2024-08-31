import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View your account and poker statistics'),
    async execute(interaction) {
    }
}

export default command;