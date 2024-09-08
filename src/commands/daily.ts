import { SlashCommandBuilder } from "discord.js";
import { Account, Command } from "../structures.js";
import { client } from "../client.js";

const command: Command = {
    scope: 'global',
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    async execute(interaction) {
        const member = await client.member(interaction.user.id);
        if (!member) return;

        const account = await client.account(member.id);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (account.claimed > today.getTime()) {
            await interaction.reply({ content: 'You have already claimed your reward today.', ephemeral: true }).catch(() => { });
            return;
        }

        await client.account(member.id, account => {
            account.claimed = now.getTime();
            account.streak = today.getTime() - account.claimed <= 86400000 ? account.streak + 1 : 1;
            account.balance += 100;
        });

        await interaction.reply({ content: 'You have claimed your daily reward of $100!', ephemeral: true }).catch(() => { });
    }
}

export default command;