import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('table')
        .setDescription('Interact with the table'),
    async execute(interaction) {
    }
}

export default command;