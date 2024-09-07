import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command, Table } from "../structures.js";
import { client } from "../client.js";
import { Image, loadImage } from "skia-canvas";
import { Blob } from "buffer";
import { readFile } from "fs/promises";
import { URL } from "url";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('hand')
        .setDescription('View your hand'),
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
        if (!player) {
            await interaction.reply({ content: 'You are not a player in this table.', ephemeral: true }).catch(() => { });
            return;
        }

        const image = player.hand ? await client.canvas(1000, 726, async ({ ctx, width, height }) => {
            const first = await loadImage(`./assets/cards/${player.hand![0]}.png`);
            const second = await loadImage(`./assets/cards/${player.hand![1]}.png`);

            ctx.drawImage(first, 0, 0, 500 - 25, 726);
            ctx.drawImage(second, 500 + 25, 0, 500 - 25, 726);
        }) : null;

        const embed = new EmbedBuilder()
            .setColor(Number(process.env.COLOR))
            .setTitle(`Your Hand`)
            .setDescription(player.hand ? null : 'No cards')
            .setImage(image ? 'attachment://image.png' : null);

        await interaction.reply({
            embeds: [embed],
            files: image ? [image] : [],
            ephemeral: true
        }).catch(() => { });
    }
}

export default command;