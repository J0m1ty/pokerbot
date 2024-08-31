import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('wager')
        .setDescription('Modify your wager'),
    async execute(interaction) {
    }
}

export default command;