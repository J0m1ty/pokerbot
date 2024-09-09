import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";
import { client } from "../client.js";
import { ellipse, rect } from "../utils.js";
import { Canvas, loadImage } from "skia-canvas";

const command: Command = {
    scope: 'dm',
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Developer test command'),
    async execute(interaction) {
        const image = await client.canvas(1000, 500, async ({ ctx, width, height }) => {
            const tableMargin = 0, dealerArea = 200, dealerWidth = 500;
            ctx.beginPath();
            ctx.moveTo(tableMargin, tableMargin);
            ctx.lineTo(width - tableMargin, tableMargin);
            ctx.lineTo(width - tableMargin, tableMargin + dealerArea);
            ctx.quadraticCurveTo(width - tableMargin, height - tableMargin, width / 2, height - tableMargin);
            ctx.quadraticCurveTo(tableMargin, height - tableMargin, tableMargin, tableMargin + dealerArea);
            ctx.closePath();
            ctx.fillStyle = '#0d0c17';
            ctx.fill();

            const feltMargin = 10;
            ctx.beginPath();
            ctx.moveTo(tableMargin + feltMargin, tableMargin + feltMargin);
            ctx.lineTo(width - tableMargin - feltMargin, tableMargin + feltMargin);
            ctx.lineTo(width - tableMargin - feltMargin, tableMargin + dealerArea - feltMargin);
            ctx.quadraticCurveTo(width - tableMargin - feltMargin, height - tableMargin - feltMargin, width / 2, height - tableMargin - feltMargin);
            ctx.quadraticCurveTo(tableMargin + feltMargin, height - tableMargin - feltMargin, tableMargin + feltMargin, tableMargin + dealerArea - feltMargin);
            ctx.closePath();
            ctx.fillStyle = '#214b2d';
            ctx.fill();
            
            const designCanvas = new Canvas(width, height);

            await (async () => {
                const ctx = designCanvas.getContext('2d');

                const suitSize = 38;
                const colorize = async (path: string, color: string) => {
                    const r = parseInt(color.substring(1, 3), 16);
                    const g = parseInt(color.substring(3, 5), 16);
                    const b = parseInt(color.substring(5, 7), 16);

                    const canvas = new Canvas(suitSize, suitSize);
                    const ctx = canvas.getContext('2d');
                    const image = await loadImage(path);
                    ctx.drawImage(image, 0, 0, suitSize, suitSize);

                    const imageData = ctx.getImageData(0, 0, suitSize, suitSize);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i + 3] == 0) continue;
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                    }

                    ctx.putImageData(imageData, 0, 0);

                    return canvas;
                }

                const spade = await colorize('./assets/suits/spades.png', '#286842');
                const club = await colorize('./assets/suits/clubs.png', '#286842');
                const heart = await colorize('./assets/suits/hearts.png', '#286842');
                const diamond = await colorize('./assets/suits/diamonds.png', '#286842');

                // a 4x4 diamond-shaped arragment of suit icons, with lines in between and small circles at the corners
                const spacing = 48, lineWidth = 3, circleSize = 5;
                const design = (x: number, y: number) => {
                    const positions = [
                        { dx: 0, dy: -3 * spacing, image: heart },
                        { dx: -1 * spacing, dy: -2 * spacing, image: diamond },
                        { dx: 1 * spacing, dy: -2 * spacing, image: club },
                        { dx: -2 * spacing, dy: -1 * spacing, image: club },
                        { dx: 0, dy: -1 * spacing, image: spade },
                        { dx: 2 * spacing, dy: -1 * spacing, image: heart },
                        { dx: -3 * spacing, dy: 0, image: spade },
                        { dx: -1 * spacing, dy: 0, image: diamond },
                        { dx: 1 * spacing, dy: 0, image: heart },
                        { dx: 3 * spacing, dy: 0, image: spade },
                        { dx: -2 * spacing, dy: 1 * spacing, image: diamond },
                        { dx: 0, dy: 1 * spacing, image: club },
                        { dx: 2 * spacing, dy: 1 * spacing, image: heart },
                        { dx: -1 * spacing, dy: 2 * spacing, image: spade },
                        { dx: 1 * spacing, dy: 2 * spacing, image: diamond },
                        { dx: 0, dy: 3 * spacing, image: club }
                    ];


                    // Loop through positions and draw images
                    positions.forEach(pos => {
                        ctx.drawImage(pos.image, x - suitSize / 2 + pos.dx, y - suitSize / 2 + pos.dy, suitSize, suitSize);
                    });

                    // Draw lines
                    ctx.strokeStyle = '#286842';
                    ctx.lineWidth = lineWidth;

                    ctx.beginPath();
                    ctx.moveTo(x - spacing, y - spacing);
                    ctx.lineTo(x + spacing, y + spacing);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x + spacing, y - spacing);
                    ctx.lineTo(x - spacing, y + spacing);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x - spacing * 3, y - spacing);
                    ctx.lineTo(x + spacing, y + spacing * 3);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x + spacing * 3, y - spacing);
                    ctx.lineTo(x - spacing, y + spacing * 3);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x - spacing, y - spacing * 3);
                    ctx.lineTo(x + spacing * 3, y + spacing);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x + spacing, y - spacing * 3);
                    ctx.lineTo(x - spacing * 3, y + spacing);
                    ctx.stroke();

                    // Draw circles, should be 17 in total
                    ellipse(ctx, x, y, circleSize, circleSize, '#286842');
                    ellipse(ctx, x - spacing * 2, y, circleSize, circleSize, '#286842');
                    ellipse(ctx, x + spacing * 2, y, circleSize, circleSize, '#286842');
                    ellipse(ctx, x, y - spacing * 2, circleSize, circleSize, '#286842');
                    ellipse(ctx, x, y + spacing * 2, circleSize, circleSize, '#286842');
                    ellipse(ctx, x - spacing, y - spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x + spacing, y + spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x + spacing, y - spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x - spacing, y + spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x - spacing * 3, y - spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x + spacing * 3, y + spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x + spacing * 3, y - spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x - spacing * 3, y + spacing, circleSize, circleSize, '#286842');
                    ellipse(ctx, x - spacing, y - spacing * 3, circleSize, circleSize, '#286842');
                    ellipse(ctx, x + spacing, y + spacing * 3, circleSize, circleSize, '#286842');
                    ellipse(ctx, x + spacing, y - spacing * 3, circleSize, circleSize, '#286842');
                    ellipse(ctx, x - spacing, y + spacing * 3, circleSize, circleSize, '#286842');

                }

                design(width / 2 - 225, height / 2);
                design(width / 2, height / 2 + 200);
                design(width / 2 + 225, height / 2);

                // dealer area (semicircle on the felt)
                ctx.strokeStyle = '#cbd3c2';
                ctx.lineWidth = 12;
                ellipse(ctx, width / 2, tableMargin - feltMargin, dealerWidth / 2, dealerWidth / 2, '#385344', true);

                ctx.lineWidth = 2;
                ellipse(ctx, width / 2, tableMargin - feltMargin, dealerWidth / 2 - feltMargin, dealerWidth / 2 - feltMargin, null, true);

                ctx.lineCap = 'round';

                // mask the table
                ctx.globalCompositeOperation = 'destination-in';

                ctx.beginPath();
                ctx.moveTo(tableMargin + feltMargin, tableMargin + feltMargin);
                ctx.lineTo(width - tableMargin - feltMargin, tableMargin + feltMargin);
                ctx.lineTo(width - tableMargin - feltMargin, tableMargin + dealerArea - feltMargin);
                ctx.quadraticCurveTo(width - tableMargin - feltMargin, height - tableMargin - feltMargin, width / 2, height - tableMargin - feltMargin);
                ctx.quadraticCurveTo(tableMargin + feltMargin, height - tableMargin - feltMargin, tableMargin + feltMargin, tableMargin + dealerArea - feltMargin);
                ctx.closePath();
                ctx.fillStyle = '#286842';
                ctx.fill();

                ctx.globalCompositeOperation = 'source-over';
            })();

            ctx.drawImage(designCanvas, 0, 0);
        });

        const embed = new EmbedBuilder()
            .setColor(Number(process.env.COLOR))
            .setImage('attachment://image.png');

        await interaction.reply({ embeds: [embed], files: [image] });
    }
}

export default command;