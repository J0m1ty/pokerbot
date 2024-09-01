import { SlashCommandBuilder } from "discord.js";
import { Account, Command } from "../structures.js";
import { client } from "../client.js";
import { JOIN_BONUS } from "../config/constants.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    async execute(interaction) {
        const account = await client.db.table('economy').get<Account>(interaction.user.id) ?? { claimed: 0, balance: JOIN_BONUS };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (account.claimed > today.getTime()) {
            await interaction.reply({ content: 'You have already claimed your reward today.', ephemeral: true }).catch(() => {});
            return;
        }

        account.claimed = now.getTime();
        account.balance += 100;

        await client.db.table('economy').set<Account>(interaction.user.id, account);

        await interaction.reply({ content: 'You have claimed your daily reward of $100!', ephemeral: true }).catch(() => {});
    }
}

export default command;