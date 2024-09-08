import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";
import { info } from "../embeds/info.js";
import { client } from "../client.js";

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
                .addIntegerOption(option =>
                    option.setName('buyin')
                        .setDescription('The amount of money to buy in with (for Blackjack)')
                        .setMinValue(1)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Leave the table')
        ),
    async execute(interaction) {
        const channel = await client.channel(interaction.channelId);
        if (!channel) return;

        const table = client.tables.get(channel.id);
        if (!table) {
            await interaction.reply({ content: 'No table has been registered to this channel.', ephemeral: true }).catch(() => { });
            return;
        }

        const member = await client.member(interaction.user.id);
        if (!member) return;

        switch (interaction.options.getSubcommand()) {
            case 'info':
                const embed = info(table.game, table.stakes, channel.name, table.players.length, table.options.maxPlayers, Object.entries(table.options).reduce((acc, [key, value]) => {
                    acc[key] = value ? value.toString() : 'None';
                    return acc;
                }, {} as Record<string, string>));

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            case 'join':
                const account = await client.account(member.id);
                const buyin = table.game == "texasholdem" ? table.options.buyIn : Math.max(interaction.options.getInteger('buyin') ?? account.balance, table.options.maxBet);
                
                const joinResult = await table.join(member.id, buyin);

                switch (joinResult) {
                    case 'extant':
                        await interaction.reply({ content: 'You have already joined the table.', ephemeral: true });
                        break;
                    case 'full':
                        await interaction.reply({ content: 'The table is full.', ephemeral: true });
                        break;
                    case 'rejoin':
                        await interaction.reply({ content: 'You have rejoined the table.', ephemeral: true });
                        break;
                    case 'insufficient':
                        await interaction.reply({ content: 'You do not have enough money to buy in.', ephemeral: true });
                        break;
                    default:
                        await interaction.reply({ content: 'You have joined the table.', ephemeral: true });
                        break;
                }
                break;
            case 'leave':
                const leaveResult = await table.leave(member.id);

                switch (leaveResult) {
                    case 'invalid':
                        await interaction.reply({ content: 'You are not in the table.', ephemeral: true });
                        break;
                    case 'leaving':
                        await interaction.reply({ content: 'You are set to leave the table before next round.', ephemeral: true });
                        break;
                    default:
                        await interaction.reply({ content: 'You have left the table.', ephemeral: true });
                        break;
                }
                break;
        }
    }
}

export default command;