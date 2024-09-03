import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command, Table } from "../structures.js";
import { client } from "../client.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register a table with the bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('blackjack')
                .setDescription('Register a blackjack table')
                .addNumberOption(option =>
                    option.setName('decks')
                        .setDescription('The number of decks to use')
                        .setMinValue(1)
                        .setMaxValue(8)
                )
                .addNumberOption(option =>
                    option.setName('maxplayers')
                        .setDescription('The maximum number of players')
                        .setMinValue(2)
                        .setMaxValue(7)
                )
                .addNumberOption(option =>
                    option.setName('minbet')
                        .setDescription('The minimum bet amount')
                        .setMinValue(1)
                )
                .addNumberOption(option =>
                    option.setName('maxbet')
                        .setDescription('The maximum bet amount')
                        .setMinValue(1)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('texasholdem')
                .setDescription('Register a Texas Hold\'em table')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = await client.channel(interaction.channelId);
        if (!channel) return;

        if (await client.db.table('tables').has(channel.id)) {
            await interaction.reply({ content: 'A table has already been registered in this channel.', ephemeral: true }).catch(() => { });
            return;
        }

        const game = interaction.options.getSubcommand() as ("blackjack" | "texasholdem");

        await client.db.table('tables').set<Table>(channel.id, game == "blackjack" ? {
            id: channel.id,
            game,
            decks: interaction.options.getInteger('decks') ?? 4,
            maxPlayers: interaction.options.getInteger('maxplayers') ?? 7,
            minBet: interaction.options.getInteger('minbet') ?? 1,
            maxBet: interaction.options.getInteger('maxbet') ?? null,
        } : {
            id: channel.id,
            game,
        });

        await interaction.reply({ content: 'Table registered successfully!', ephemeral: true }).catch(() => { });
    }
}

export default command;