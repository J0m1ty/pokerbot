import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('stand')
        .setDescription('End your turn and keep your current hand'),
    async execute(interaction) {
    }
}

export default command;