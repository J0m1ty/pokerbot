import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('double')
        .setDescription('Double your bet and receive exactly one more card'),
    async execute(interaction) {
    }
}

export default command;