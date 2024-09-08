import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command, TableData } from "../structures.js";
import { client } from "../client.js";
import { Canvas, loadImage } from "skia-canvas";
import { BlackjackPlayer } from "../blackjack.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('hand')
        .setDescription('View your hand'),
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

        const player = table.players.find(player => player.id == member.id);
        if (!player) {
            await interaction.reply({ content: 'You are not a player in this table.', ephemeral: true }).catch(() => { });
            return;
        }

        await interaction.reply({ content: `Your hand: ${JSON.stringify(player.hand)}`, ephemeral: true }).catch(() => { });

        // if ('split' in player.hand && player.hand.split) {
        //     await interaction.reply({ content: 'You have split hands; WIP.', ephemeral: true }).catch(() => { });
        //     return;
        // }

        // const image = await client.canvas(1000, 726, async ({ ctx, width, height }) => {
        //     const hand = 'split' in player.hand! ? (player.hand.split ? [] : player.hand.cards) : player.hand!;

        //     const cards = [ await loadImage(`./assets/cards/${hand[0]}.png`), await loadImage(`./assets/cards/${hand[1]}.png`) ];

        //     const first = new Canvas(cards[0].width, cards[0].height);
        //     const second = new Canvas(cards[1].width, cards[1].height);

        //     const ctx1 = first.getContext('2d');
        //     const ctx2 = second.getContext('2d');

        //     ctx1.drawImage(cards[0], 0, 0);
        //     ctx2.drawImage(cards[1], 0, 0);

        //     ctx.drawCanvas(first, 0, 0, (width - 25) / 2, height);
        //     ctx.drawCanvas(second, (width + 25) / 2, 0, (width - 25) / 2, height);
        // });

        // const embed = new EmbedBuilder()
        //     .setColor(Number(process.env.COLOR))
        //     .setTitle(`Your Hand`)
        //     .setImage('attachment://image.png');

        // await interaction.reply({
        //     embeds: [embed],
        //     files: [image],
        //     ephemeral: true
        // }).catch(() => { });
    }
}

export default command;