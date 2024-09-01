import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
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

        const image = await client.canvas(600, 200, ({ ctx, width, height }) => {
            ctx.fillStyle = '#0099FF';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px sans-serif';
            ctx.fillText(`Balance: $${account.balance}`, 20, 20);
        });

        await interaction.reply({ 
            embeds: [ balance(interaction.user.displayName, account.balance) ],
            files: [ image ]
        }).catch(() => {});
    }
}

export default command;