import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('hand')
        .setDescription('View your hand'),
    async execute(interaction) {
    }
}

export default command;