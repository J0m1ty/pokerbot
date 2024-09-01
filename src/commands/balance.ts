import { SlashCommandBuilder } from "discord.js";
import { Account, Command } from "../structures.js";
import { client } from "../client.js";
import { balance } from "../embeds/balance.js";
import { JOIN_BONUS } from "../config/constants.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('View your account balance'),
    async execute(interaction) {
        const account: Account = await client.db.table('economy').get<Account>(interaction.user.id) ?? { claimed: 0, balance: JOIN_BONUS };

        await interaction.reply({ embeds: [ balance(interaction.user.displayName, account.balance) ] }).catch(() => {});
    }
}

export default command;