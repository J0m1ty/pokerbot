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
                .addIntegerOption(option =>
                    option.setName('decks')
                        .setDescription('The number of decks to use')
                        .setMinValue(1)
                        .setMaxValue(8)
                )
                .addIntegerOption(option =>
                    option.setName('maxplayers')
                        .setDescription('The maximum number of players')
                        .setMinValue(1)
                        .setMaxValue(7)
                )
                .addIntegerOption(option =>
                    option.setName('minbet')
                        .setDescription('The minimum bet amount')
                        .setMinValue(1)
                )
                .addIntegerOption(option =>
                    option.setName('maxbet')
                        .setDescription('The maximum bet amount')
                        .setMinValue(1)
                )
                .addIntegerOption(option =>
                    option.setName('duration')
                        .setDescription('The maximum duration of a player\'s turn in seconds')
                        .setMinValue(1)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('texasholdem')
                .setDescription('Register a Texas Hold\'em table')
                .addIntegerOption(option =>
                    option.setName('maxplayers')
                        .setDescription('The maximum number of players')
                        .setMinValue(2)
                        .setMaxValue(9)
                )
                .addIntegerOption(option =>
                    option.setName('smallblind')
                        .setDescription('The small blind amount')
                        .setMinValue(1)
                )
                .addIntegerOption(option =>
                    option.setName('bigblind')
                        .setDescription('The big blind amount')
                        .setMinValue(2)
                )
                .addIntegerOption(option =>
                    option.setName('buyin')
                        .setDescription('The buy-in amount')
                        .setMinValue(100)
                )
                .addIntegerOption(option =>
                    option.setName('duration')
                        .setDescription('The maximum duration of a player\'s turn in seconds')
                        .setMinValue(1)
                )
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

        const minBet = (game == "blackjack" ? interaction.options.getInteger('minbet') : interaction.options.getInteger('bigblind')) ?? 1;

        await client.db.table('tables').set<Table>(channel.id, game == "blackjack" ? {
            id: channel.id,
            game,
            stakes: minBet <= 10 ? 'low' : minBet <= 50 ? 'medium' : 'high',
            turnDuration: interaction.options.getInteger('duration') ?? 20,
            players: [],
            state: {},
            options: {
                decks: interaction.options.getInteger('decks') ?? 4,
                maxPlayers: interaction.options.getInteger('maxplayers') ?? 7,
                minBet: interaction.options.getInteger('minbet') ?? 1,
                maxBet: interaction.options.getInteger('maxbet') ?? minBet * 25
            }
        } : {
            id: channel.id,
            game,
            stakes: minBet <= 5 ? 'low' : minBet <= 20 ? 'medium' : 'high',
            turnDuration: interaction.options.getInteger('duration') ?? 20,
            players: [],
            state: {},
            options: {
                maxPlayers: interaction.options.getInteger('maxplayers') ?? 9,
                smallBlind: interaction.options.getInteger('smallblind') ?? 1,
                bigBlind: interaction.options.getInteger('bigblind') ?? minBet * 2,
                buyIn: interaction.options.getInteger('buyin') ?? minBet * 50
            }
        });

        await interaction.reply({ content: 'Table registered successfully!', ephemeral: true }).catch(() => { });
    }
}

export default command;