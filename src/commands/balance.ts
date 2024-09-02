import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Account, Command } from "../structures.js";
import { client } from "../client.js";
import { EMBED_COLOR, EMBED_COLOR_HEX, JOIN_BONUS } from "../config/constants.js";
import { loadImage } from "skia-canvas";

const map = (n: number, from1: number, to1: number, from2: number, to2: number) => (n - from1) / (to1 - from1) * (to2 - from2) + from2;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const chips: { [ value: number ]: { color: string, highlight: string, accent: string } } = {
    1: { color: '239,239,239', highlight: '125,125,125', accent: '63,97,178' },
    5: { color: '211,48,53', highlight: '125,125,125', accent: '219,222,229' },
    10: { color: '56,93,177', highlight: '125,125,125', accent: '219,222,229' },
    25: { color: '0,189,94', highlight: '125,125,125', accent: '219,222,229' },
    50: { color: '255,154,0', highlight: '125,125,125', accent: '219,222,229' },
    100: { color: '31,29,30', highlight: '125,125,125', accent: '219,222,229' },
    500: { color: '120,75,180', highlight: '125,125,125', accent: '219,222,229' },
    1000: { color: '245,215,52', highlight: '125,125,125', accent: '31,29,30' },
    5000: { color: '244,94,167', highlight: '125,125,125', accent: '219,222,229' },
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
            if (amount - value * 8 < 0 && value != 1) break;
        }
    }

    return result.sort((a, b) => b.count - a.count);
}

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('View your account balance'),
    async execute(interaction) {
        const account: Account = await client.db.table('economy').get<Account>(interaction.user.id) ?? { claimed: 0, balance: JOIN_BONUS };

        const stacks = distribute(account.balance);

        const image = await client.canvas(600, 200, async ({ ctx, width, height }) => {
            ctx.fillStyle = EMBED_COLOR_HEX;
            ctx.fillRect(0, 0, width, height);

            const tx = width / 2, ty = height * 0.65;

            ctx.beginPath();
            ctx.fillStyle = '#5C4033';
            ctx.moveTo(tx - 280, ty);
            ctx.lineTo(tx + 280, ty);
            ctx.lineTo(tx + 280 - 25, height);
            ctx.lineTo(tx - 280 + 25, height);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = '#17e605';
            ctx.ellipse(tx, ty - 5, 280, 90, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = '#134f12';
            ctx.ellipse(tx, ty + 5, 280, 90, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            const gradient = ctx.createRadialGradient(tx, ty, 0, tx, ty, 280);
            gradient.addColorStop(0, '#2ce31b');
            gradient.addColorStop(1, '#34b514');
            ctx.fillStyle = gradient;
            ctx.ellipse(tx, ty, 280, 90, 0, 0, Math.PI * 2);
            ctx.fill();

            const chipX = 20, chipY = 4;

            const display = ({ x, y, chips, color, highlight, accent }: { x: number, y: number, chips: number, color: string, highlight: string, accent: string }) => {
                for (let i = 0; i < chips; i++) {
                    for (let j = 0; j < chipY; j++) {
                        ctx.beginPath();
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = (j == chipY - 1 && i != chips - 1) ? `rgba(${highlight}, 0.25)` : `rgba(${color}, 0.25)`;
                        ctx.fillStyle = `rgba(${color}, 1)`;
                        ctx.ellipse(x, y - (i * chipY) - j, chipX, 8, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                    }

                    if (i % 2 == chips % 2) continue;

                    // center design
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(${accent}, 0.85)`;
                    ctx.moveTo(x - 1.5, y - (i * chipY) + 5.5);
                    ctx.lineTo(x + 1.5, y - (i * chipY) + 5.5);
                    ctx.lineTo(x + 1.5, y - (i * chipY) + 8.5);
                    ctx.lineTo(x - 1.5, y - (i * chipY) + 8.5);
                    ctx.fill();

                    // right design
                    ctx.beginPath();
                    ctx.moveTo(x + 12, y - (i * chipY) + 4);
                    ctx.lineTo(x + 14.5, y - (i * chipY) + 3);
                    ctx.lineTo(x + 14.5, y - (i * chipY) + 6);
                    ctx.lineTo(x + 12, y - (i * chipY) + 7);
                    ctx.fill();

                    // left design
                    ctx.beginPath();
                    ctx.moveTo(x - 12, y - (i * chipY) + 4);
                    ctx.lineTo(x - 14.5, y - (i * chipY) + 3);
                    ctx.lineTo(x - 14.5, y - (i * chipY) + 6);
                    ctx.lineTo(x - 12, y - (i * chipY) + 7);
                    ctx.fill();
                }

                // center design
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${accent}, 0.7)`;
                ctx.lineWidth = 1;
                ctx.setLineDash([2, 2]);
                ctx.ellipse(x, y - (chips * chipY) + 1, chipX * 0.4, 8 * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                // bottom center design
                ctx.beginPath();
                ctx.fillStyle = `rgba(${accent}, 0.85)`;
                ctx.moveTo(x - 1, y - (chips * chipY) + 6);
                ctx.lineTo(x + 1, y - (chips * chipY) + 6);
                ctx.lineTo(x + 1.5, y - (chips * chipY) + 9);
                ctx.lineTo(x - 1.5, y - (chips * chipY) + 9);
                ctx.fill();

                // bottom right design
                ctx.beginPath();
                ctx.moveTo(x + 9, y - (chips * chipY) + 5);
                ctx.lineTo(x + 11.5, y - (chips * chipY) + 4);
                ctx.lineTo(x + 14.5, y - (chips * chipY) + 6);
                ctx.lineTo(x + 12, y - (chips * chipY) + 7);
                ctx.fill();

                // bottom left design
                ctx.beginPath();
                ctx.moveTo(x - 9, y - (chips * chipY) + 5);
                ctx.lineTo(x - 11.5, y - (chips * chipY) + 4);
                ctx.lineTo(x - 14.5, y - (chips * chipY) + 6);
                ctx.lineTo(x - 12, y - (chips * chipY) + 7);
                ctx.fill();

                // top center design
                ctx.beginPath();
                ctx.moveTo(x - 0.9, y - (chips * chipY) - 4);
                ctx.lineTo(x + 0.9, y - (chips * chipY) - 4);
                ctx.lineTo(x + 1.4, y - (chips * chipY) - 7);
                ctx.lineTo(x - 1.4, y - (chips * chipY) - 7);
                ctx.fill();

                // top right design
                ctx.beginPath();
                ctx.moveTo(x + 9, y - (chips * chipY) - 3);
                ctx.lineTo(x + 11.5, y - (chips * chipY) - 2);
                ctx.lineTo(x + 14.5, y - (chips * chipY) - 4);
                ctx.lineTo(x + 12, y - (chips * chipY) - 5);
                ctx.fill();

                // top left design
                ctx.beginPath();
                ctx.moveTo(x - 9, y - (chips * chipY) - 3);
                ctx.lineTo(x - 11.5, y - (chips * chipY) - 2);
                ctx.lineTo(x - 14.5, y - (chips * chipY) - 4);
                ctx.lineTo(x - 12, y - (chips * chipY) - 5);
                ctx.fill();
            }

            const counts: { [pos: number]: number } = { [-1]: 1, [0]: 0, [1]: 0 };

            for (let i = 1; i < stacks.length; i++) {
                if (counts[1] < counts[0] - 1) counts[1]++;
                else if (counts[0] < counts[-1] - 1) counts[0]++;
                else counts[-1]++;
            }

            const scale = clamp(map(stacks.length, 1, 16, 2, 1), 1, 2);

            const gapX = 45, gapY = 25;
            ctx.save();
            ctx.translate(tx, ty);
            ctx.scale(scale, scale);
            for (let i = -1; i <= 1; i++) {
                const count = counts[i];
                const half = count / 2;
                for (let j = 0; j < count; j++) {
                    const stack = stacks.shift();
                    if (!stack) continue;
                    
                    display({ 
                        x: - half * gapX + j * gapX + gapX / 2,
                        y: i * gapY + (gapY / 2) * (counts[1] == 0 ? 1 : 0),
                        chips: stack.count, 
                        ...chips[stack.value]
                    });
                }
            }
            ctx.restore();

            const image = await loadImage('./images/white_chip.png');

            ctx.drawImage(image, 10, 10, 30, 30);
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(`$${account.balance.toLocaleString()}`, 45, 24);
        });

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(`${interaction.user.displayName}'s Chips`)
            .setImage('attachment://image.png');

        await interaction.reply({
            embeds: [embed],
            files: [image]
        }).catch(() => { });
    }
}

export default command;