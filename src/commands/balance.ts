import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Account, Command } from "../structures.js";
import { client } from "../client.js";
import { CanvasRenderingContext2D, loadImage } from "skia-canvas";
import { chips } from "../data/chips.js";
import { clamp, map } from "../utils.js";

const rect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fill: any) => {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = fill;
    ctx.fill();
}

const ellipse = (ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, fill?: any, stroke?: true) => {
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    if (stroke) ctx.stroke();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
}

const quad = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, fill: any) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
}

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
        .setDescription('View your account balance')
        .addBooleanOption(option => option.setName('private').setDescription('Whether to show the balance privately').setRequired(false)),
    async execute(interaction) {
        const member = await client.member(interaction.user.id);
        if (!member) return;
        
        const account: Account = await client.db.table('economy').get<Account>(member.id) ?? client.default;

        const stacks = distribute(account.balance);

        const image = await client.canvas(600, 200, async ({ ctx, width, height }) => {
            rect(ctx, 0, 0, width, height, `#${process.env.COLOR?.replace('0x', '')}`);

            const tx = width / 2, ty = height * 0.65, scale = clamp(map(stacks.length, 1, 16, 2, 1), 1, 1.5);

            quad(ctx, tx - 280, ty, tx + 280, ty, tx + 280 - 25, height, tx - 280 + 25, height, '#5C4033');

            ellipse(ctx, tx, ty - 5, 280, 90, '#17e605');

            ellipse(ctx, tx, ty + 5, 280, 90, '#134f12');

            const gradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, 280);
            gradient.addColorStop(0, '#2ce31b');
            gradient.addColorStop(1, '#34b514');

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

            const image = await loadImage('./assets/white_chip.png');

            ctx.drawImage(image, 10, 10, 30, 30);
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(`$${account.balance.toLocaleString()}`, 45, 24);
        });

        const embed = new EmbedBuilder()
            .setColor(Number(process.env.COLOR))
            .setTitle(`${interaction.user.displayName}'s Chips`)
            .setImage('attachment://image.png');

        await interaction.reply({
            embeds: [embed],
            files: [image],
            ephemeral: interaction.options.getBoolean('private') ?? true
        }).catch(() => { });
    }
}

export default command;