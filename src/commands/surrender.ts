import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('surrender')
        .setDescription('Forfeit half of your bet and end the round'),
    async execute(interaction) {
    }
}

export default command;