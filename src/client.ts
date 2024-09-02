import { Client as BaseClient, ClientOptions, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Account, Command } from "./structures.js";
import { QuickDB } from "quick.db";
import { GUILD_ID } from "./config/discord.js";
import { Canvas, CanvasRenderingContext2D } from "skia-canvas";

export class Client extends BaseClient {
    commands: Collection<string, Command> = new Collection();
    db: QuickDB = new QuickDB();

    get default(): Account {
        return { claimed: 0, streak: 0, balance: 1_000 };
    }

    constructor(options: ClientOptions) {
        super(options);
    }

    async canvas(width: number, height: number, fn: ({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => void | Promise<void>) {
        const canvas = new Canvas(width, height);
        const ctx = canvas.getContext('2d');
        await fn({ ctx, width, height });
        return { name: 'image.png', attachment: await canvas.toBuffer('png', { density: 2 } )};
    }

    async guild() {
        return this.guilds.cache.get(GUILD_ID) ?? await this.guilds.fetch(GUILD_ID).catch(() => null);
    }

    async member(id: string) {
        const guild = await this.guild();
        if (!guild) return null;
        return guild.members.cache.get(id) ?? await guild.members.fetch(id).catch(() => null);
    }

    async role(id: string) {
        const guild = await this.guild();
        if (!guild) return null;
        return guild.roles.cache.get(id) ?? await guild.roles.fetch(id).catch(() => null);
    }

    async channel(id: string) {
        const guild = await this.guild();
        if (!guild) return null;
        return guild.channels.cache.get(id) ?? await guild.channels.fetch(id).catch(() => null);
    }
}

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