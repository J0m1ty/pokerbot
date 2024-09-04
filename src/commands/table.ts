import { SlashCommandBuilder } from "discord.js";
import { Account, BlackjackPlayer, Command, Table } from "../structures.js";
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

        const table = await client.db.table('tables').get<Table>(channel.id);
        if (!table) {
            await interaction.reply({ content: 'No table has been registered to this channel.', ephemeral: true }).catch(() => { });
            return;
        }

        const member = await client.member(interaction.user.id);
        if (!member) return;

        const player = table.players.find(player => player.id == member.id);
        
        switch (interaction.options.getSubcommand()) {
            case 'info':
                const embed = info(table.game, table.stakes, channel.name, table.players.length, table.options.maxPlayers, Object.entries(table.options).reduce((acc, [key, value]) => {
                    acc[key] = value ? value.toString() : 'None';
                    return acc;
                }, {} as Record<string, string>));

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            case 'join':
                if (table.players.length >= table.options.maxPlayers) {
                    await interaction.reply({ content: 'The table is full.', ephemeral: true });
                    return;
                }

                if (player) {
                    if (player.leaving) {
                        player.leaving = false;
                        await client.db.table('tables').set<Table>(channel.id, table);

                        await interaction.reply({ content: 'You have rejoined the table.', ephemeral: true });
                        return;
                    }

                    await interaction.reply({ content: 'You have already joined this table.', ephemeral: true });
                    return;
                }
                
                const account = await client.db.table('economy').get<Account>(member.id) ?? client.default;
                const buyin = table.game == "texasholdem" ? table.options.buyIn : Math.max(interaction.options.getInteger('buyin') ?? account.balance, table.options.maxBet);

                if (account.balance < buyin) {
                    await interaction.reply({ content: 'You do not have enough money to join the table.', ephemeral: true });
                    return;
                }

                if (table.game == "blackjack") {
                    table.players.push({
                        id: member.id,
                        balance: buyin,
                        history: [],
                        leaving: false,
                        wager: table.options.minBet
                    });
                }
                else {
                    table.players.push({
                        id: member.id,
                        balance: buyin,
                        history: [],
                        leaving: false,
                        seat: Array.from({ length: table.options.maxPlayers }, (_, i) => i).find(seat => !table.players.some(player => player.seat == seat))!
                    });
                }

                account.balance -= buyin;
                await client.db.table('economy').set<Account>(member.id, account);
                await client.db.table('tables').set<Table>(channel.id, table);

                await interaction.reply({ content: 'You have joined the table.', ephemeral: true });
                break;
            case 'leave':
                if (!player) {
                    await interaction.reply({ content: 'You have not joined the table.', ephemeral: true });
                    return;
                }

                if (player.leaving) {
                    await interaction.reply({ content: 'You are already leaving the table.', ephemeral: true });
                    return;
                }

                player.leaving = true;
                await client.db.table('tables').set<Table>(channel.id, table);

                await interaction.reply({ content: 'You are queued to leave.', ephemeral: true });
                break;
        }
    }
}

export default command;