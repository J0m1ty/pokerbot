import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'dm',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        let time = Date.now();
        await interaction.reply({ content: 'Pinging...', ephemeral: true });
        
        let diff = Date.now() - time;
        await interaction.editReply(`Pong! \`${diff}ms\``);
    }
}

export default command;