import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'global',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),
    async execute(interaction) {
        let time = Date.now();
        await interaction.reply({ content: 'Pinging...', ephemeral: true });
        
        let diff = Date.now() - time;
        await interaction.editReply(`Pong! \`${diff}ms\``);
    }
}

export default command;