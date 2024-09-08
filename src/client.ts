import { Client as BaseClient, ClientOptions, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Account, Command, TableData } from "./structures.js";
import { QuickDB } from "quick.db";
import { Canvas, CanvasRenderingContext2D } from "skia-canvas";
import { BlackjackTable } from "./blackjack.js";
import { TexasHoldemTable } from "./texasholdem.js";
import { Table } from "./poker.js";

// Custom client class that extends the Discord.js client
export class Client extends BaseClient {
    commands: Collection<string, Command> = new Collection(); // Collection of commands
    tables: Collection<string, Table> = new Collection(); // Collection of tables
    db: QuickDB = new QuickDB(); // Quick.db instance

    constructor(options: ClientOptions) {
        super(options);

        // this.db.table('tables').deleteAll();

        // this.db.table('economy').set('544963690185752576', { claimed: 0, streak: 0, balance: 10_000 });

        this.on('ready', () => {
            this.db.table('tables').all<TableData>().then(tables => {
                for (const { id, value } of tables) {
                    this.tables.set(id, value.game === 'blackjack' ? new BlackjackTable(value) : new TexasHoldemTable(value));
                }
            });
        });
    }

    // Utility function to create a canvas, display graphics, and return the image as an attachment
    async canvas(width: number, height: number, fn: ({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => void | Promise<void>) {
        const canvas = new Canvas(width, height);
        const ctx = canvas.getContext('2d');
        await fn({ ctx, width, height });
        return { name: 'image.png', attachment: await canvas.toBuffer('png', { density: 2 }) };
    }

    // Grabs a user's account from the database
    async account(id: string) {
        return await this.db.table('economy').get<Account>(id) ?? { claimed: 0, streak: 0, balance: 1_000 };
    }

    // Sets a user's account in the database
    async setAccount(id: string, account: Account) {
        await this.db.table('economy').set<Account>(id, account);
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