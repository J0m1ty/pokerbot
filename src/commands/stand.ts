import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";
import { client } from "../client.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('stand')
        .setDescription('End your turn and keep your current hand'),
    async execute(interaction) {
        const channel = await client.channel(interaction.channelId);
        if (!channel) return;

        const table = client.tables.get(channel.id);
        if (!table) {
            await interaction.reply({ content: 'No table has been registered to this channel.', ephemeral: true }).catch(() => { });
            return;
        }

        if (table.game != 'blackjack') {
            await interaction.reply({ content: 'This command is only available in Blackjack tables.', ephemeral: true });
            return;
        }
        
        const member = await client.member(interaction.user.id);
        if (!member) return;

        const standResult = await table.stand(member.id);
        
        switch (standResult) {
            case 'unavailable':
                await interaction.reply({ content: 'This command is not available to you right now.', ephemeral: true });
                break;
            case 'not_turn':
                await interaction.reply({ content: 'It is not your turn.', ephemeral: true });
                break;
            case 'success':
                await interaction.reply({ content: `[${member.id.substring(0, 5)}] Stood!` });
                break;
        } 
    }
}

export default command;