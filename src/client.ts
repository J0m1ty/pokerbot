import { Client as BaseClient, ClientOptions, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Account, Command, Table } from "./structures.js";
import { QuickDB } from "quick.db";
import { Canvas, CanvasRenderingContext2D } from "skia-canvas";

// Custom client class that extends the Discord.js client
export class Client extends BaseClient {
    commands: Collection<string, Command> = new Collection(); // Collection of commands
    loops: Collection<string, NodeJS.Timeout> = new Collection(); // Collection of game loops
    db: QuickDB = new QuickDB(); // Quick.db instance

    constructor(options: ClientOptions) {
        super(options);

        this.db.table('tables').all<Table>().then(tables => {
            for (const { id, value: table } of tables) {
                this.loops.set(id, setTimeout(async () => {
                    await this.update(id);
                }, table.turnDuration * 1_000));
            }
        });
    }

    // Utility function to get the default account object (used to maintain a consistent account structure)
    get getDefaultAccount(): Account {
        return { claimed: 0, streak: 0, balance: 1_000 };
    }

    // Update a table
    async update(id: string) {
        const table = await this.db.table('tables').get<Table>(id);
        if (!table) return;

        if (table.state.phase != 'playing') return;

        if (table.game == 'blackjack') {
            const state = table.state;

            const player = table.players.find(player => player.id == state.currentTurn);
            if (!player) return;

            if (player.queuedAction) {
                player.inactivity = 0;

                switch (player.queuedAction.type) {
                    case 'stand':
                        if (state.currentHand + 1 < player.hands.length) {
                            state.currentHand += 1;
                        }
                        else {
                            // find the next player
                            const next = table.players.sort((a, b) => b.seat - a.seat).find(p => p.seat > player.seat);
                        }
                        break;
                    case 'hit':
                        player.hands[state.currentHand].hand.push(table.cards.pop()!);
                        break;
                    case 'double':
                        if (player.balance < player.wager) break;
                        player.balance -= player.wager;

                        player.hands[state.currentHand].doubled = true;
                        player.hands[state.currentHand].hand.push(table.cards.pop()!);
                        break;
                    case 'split':
                        if (player.balance < player.wager) break;
                        player.balance -= player.wager;

                        const split = player.hands[state.currentHand].hand.pop()!;

                        player.hands[state.currentHand].hand.push(table.cards.pop()!);

                        player.hands.push({
                            hand: [split, table.cards.pop()!],
                            doubled: false
                        });
                        break;
                    case 'insurance':
                        if (player.balance < player.queuedAction.bet || !table.cards[0].startsWith('ace')) break;
                        player.balance -= player.queuedAction.bet;
                        player.insurenceBet = player.queuedAction.bet;
                        break;
                }

                player.queuedAction = null;
            }
            else {
                player.inactivity += 1;

                if (player.inactivity >= 3) {
                    player.leaving = true;
                }
            }
        }

        // if end of turn and cards are less than 52, remake the deck

        await this.db.table('tables').set(id, table);

        this.loops.set(id, setTimeout(async () => {
            await this.update(id);
        }, table.turnDuration * 1_000));
    }

    // Immediately update a table upon receiving a command
    async action(id: string) {
        const timeout = this.loops.get(id);
        if (timeout) {
            clearTimeout(timeout);
            this.loops.delete(id);
        }

        await this.update(id);
    }

    // Utility function to create a canvas, display graphics, and return the image as an attachment
    async canvas(width: number, height: number, fn: ({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => void | Promise<void>) {
        const canvas = new Canvas(width, height);
        const ctx = canvas.getContext('2d');
        await fn({ ctx, width, height });
        return { name: 'image.png', attachment: await canvas.toBuffer('png', { density: 2 }) };
    }

    // Grabs the bot's guild in a safe manner
    async guild() {
        const id = process.env.GUILD_ID ?? '';
        return this.guilds.cache.get(id) ?? await this.guilds.fetch(id).catch(() => null);
    }

    // Grabs a member from the bot's guild in a safe manner
    async member(id: string) {
        const guild = await this.guild();
        if (!guild) return null;
        return guild.members.cache.get(id) ?? await guild.members.fetch(id).catch(() => null);
    }

    // Grabs a role from the bot's guild in a safe manner
    async role(id: string) {
        const guild = await this.guild();
        if (!guild) return null;
        return guild.roles.cache.get(id) ?? await guild.roles.fetch(id).catch(() => null);
    }

    // Grabs a channel from the bot's guild in a safe manner
    async channel(id: string) {
        const guild = await this.guild();
        if (!guild) return null;
        return guild.channels.cache.get(id) ?? await guild.channels.fetch(id).catch(() => null);
    }
}

// The Discord.js client instance
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],
    partials: [Partials.Channel]
});