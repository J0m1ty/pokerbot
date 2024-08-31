import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('split')
        .setDescription('Split your hand into two if you have a pair'),
    async execute(interaction) {
    }
}

export default command;