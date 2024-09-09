import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../structures.js";
import { client } from "../client.js";
import { loadImage } from "skia-canvas";
import { chips } from "../data/chips.js";
import { clamp, ellipse, map, quad, rect } from "../utils.js";

// Helper function for distributing an amount of money into chips of proper stacks
const distribute = (amount: number) => {
    const values = Object.keys(chips).sort((a, b) => Number(b) - Number(a));
    const result: { value: number, count: number }[] = [];

    let first = true;
    for (let i = 0; i < values.length; i++) {
        const value = Number(values[i]);
        const total = Math.floor(amount / value);
        if (((first && total < 16) || total < 4) && value != 1) continue;
        first = false;
        for (let j = 0; j < total; j += 8) {
            const count = Math.min(8, total - j);
            result.push({ value, count });
            amount -= count * value;
            if (amount - value * 8 <= 0 && value != 1) break;
        }
    }

    return result.sort((a, b) => b.count - a.count);
}

const command: Command = {
    scope: 'global',
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('View your account balance'),
    async execute(interaction) {
        const member = await client.member(interaction.user.id);
        if (!member) return;
        
        const account = await client.account(member.id);

        const stacks = distribute(account.balance);

        const image = await client.canvas(600, 200, async ({ ctx, width, height }) => {
            const tx = width / 2, ty = height * 0.65, scale = clamp(map(stacks.length, 1, 16, 2, 1), 1, 1.5);

            quad(ctx, tx - 280, ty, tx + 280, ty, tx + 280 - 25, height, tx - 280 + 25, height, '#5C4033');

            ellipse(ctx, tx, ty - 5, 280, 90, '#214b2d');

            ellipse(ctx, tx, ty + 5, 280, 90, '#173620');

            const gradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, 280);
            gradient.addColorStop(0, '#286842');
            gradient.addColorStop(1, '#214b2d');

            ellipse(ctx, tx, ty, 280, 90, gradient);

            const stack = ({ x, y, chips, color, accent }: { x: number, y: number, chips: number, color: string, accent: string }) => {
                const chipX = 20, chipY = 4;
                
                for (let i = 0; i < chips; i++) {
                    for (let j = 0; j < chipY; j++) {
                        ctx.strokeStyle = `rgba(${(j == chipY - 1 && i != chips - 1) ? `125,125,125` : color}, 0.25)`;
                        ellipse(ctx, x, y - (i * chipY) - j, chipX, 8, `rgba(${color}, 1)`, true);
                    }

                    if (i % 2 == chips % 2) continue;

                    quad(ctx, x - 1.5, y - (i * chipY) + 5.5, x + 1.5, y - (i * chipY) + 5.5, x + 1.5, y - (i * chipY) + 8.5, x - 1.5, y - (i * chipY) + 8.5, `rgba(${accent}, 0.85)`);

                    quad(ctx, x + 12, y - (i * chipY) + 4, x + 14.5, y - (i * chipY) + 3, x + 14.5, y - (i * chipY) + 6, x + 12, y - (i * chipY) + 7, `rgba(${accent}, 0.85)`);

                    quad(ctx, x - 12, y - (i * chipY) + 4, x - 14.5, y - (i * chipY) + 3, x - 14.5, y - (i * chipY) + 6, x - 12, y - (i * chipY) + 7, `rgba(${accent}, 0.85)`);
                }

                ctx.strokeStyle = `rgba(${accent}, 0.7)`;
                ctx.setLineDash([2, 2]);
                ellipse(ctx, x, y - (chips * chipY) + 1, chipX * 0.4, 8 * 0.3, null, true);
                ctx.setLineDash([]);
                
                quad(ctx, x - 1, y - (chips * chipY) + 6, x + 1, y - (chips * chipY) + 6, x + 1.5, y - (chips * chipY) + 9, x - 1.5, y - (chips * chipY) + 9, `rgba(${accent}, 0.85)`);


                quad(ctx, x + 9, y - (chips * chipY) + 5, x + 11.5, y - (chips * chipY) + 4, x + 14.5, y - (chips * chipY) + 6, x + 12, y - (chips * chipY) + 7, `rgba(${accent}, 0.85)`);


                quad(ctx, x - 9, y - (chips * chipY) + 5, x - 11.5, y - (chips * chipY) + 4, x - 14.5, y - (chips * chipY) + 6, x - 12, y - (chips * chipY) + 7, `rgba(${accent}, 0.85)`);

                quad(ctx, x - 0.9, y - (chips * chipY) - 4, x + 0.9, y - (chips * chipY) - 4, x + 1.4, y - (chips * chipY) - 7, x - 1.4, y - (chips * chipY) - 7, `rgba(${accent}, 0.85)`);

                quad(ctx, x + 9, y - (chips * chipY) - 3, x + 11.5, y - (chips * chipY) - 2, x + 14.5, y - (chips * chipY) - 4, x + 12, y - (chips * chipY) - 5, `rgba(${accent}, 0.85)`);

                quad(ctx, x - 9, y - (chips * chipY) - 3, x - 11.5, y - (chips * chipY) - 2, x - 14.5, y - (chips * chipY) - 4, x - 12, y - (chips * chipY) - 5, `rgba(${accent}, 0.85)`);
            }

            const counts: { [pos: number]: number } = { [-1]: 1, 0: 0, 1: 0 };

            for (let i = 1; i < stacks.length; i++) {
                if (counts[1] < counts[0] - 1) counts[1]++;
                else if (counts[0] < counts[-1] - 1) counts[0]++;
                else counts[-1]++;
            }

            ctx.save();
            ctx.translate(tx, ty);
            ctx.scale(scale, scale);
            const gapX = 45, gapY = 25;
            for (let i = -1; i <= 1; i++) {
                const count = counts[i];
                const half = count / 2;
                for (let j = 0; j < count; j++) {
                    const top = stacks.shift();
                    if (!top) continue;
                    
                    stack({ 
                        x: - half * gapX + j * gapX + gapX / 2,
                        y: i * gapY + (gapY / 2) * (counts[1] == 0 ? 1 : 0),
                        chips: top.count, 
                        ...chips[top.value]
                    });
                }
            }
            ctx.restore();

            const image = await loadImage('./assets/chips/white_chip.png');

            ctx.drawImage(image, width - 40, 10, 30, 30);
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(`$${account.balance.toLocaleString()}`, width - 45, 24);

            ctx.textAlign = 'left';
            ctx.fillText(`${member.user.displayName}`, 10, 24);
        });

        const embed = new EmbedBuilder()
            .setColor(Number(process.env.COLOR))
            .setImage('attachment://image.png');

        await interaction.reply({
            embeds: [embed],
            files: [image]
        }).catch(() => { });
    }
}

export default command;