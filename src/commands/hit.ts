import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('hit')
        .setDescription('Request another card'),
    async execute(interaction) {

    }
}

export default command;