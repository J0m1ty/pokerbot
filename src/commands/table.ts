import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('table')
        .setDescription('Interact with the table')
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get information about the table')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Join the table')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Leave the table')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'info':
                await interaction.reply({ content: 'Table information', ephemeral: true });
                break;
            case 'join':
                await interaction.reply({ content: 'You have joined the table', ephemeral: true });
                break;
            case 'leave':
                await interaction.reply({ content: 'You have left the table', ephemeral: true });
                break;
        }
    }
}

export default command;