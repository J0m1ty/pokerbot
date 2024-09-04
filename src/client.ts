import { Client as BaseClient, ClientOptions, Collection, GatewayIntentBits, Partials } from "discord.js";
import { Account, Command } from "./structures.js";
import { QuickDB } from "quick.db";
import { Canvas, CanvasRenderingContext2D } from "skia-canvas";

// Custom client class that extends the Discord.js client
export class Client extends BaseClient {
    commands: Collection<string, Command> = new Collection(); // Collection of commands
    db: QuickDB = new QuickDB(); // Quick.db instance

    constructor(options: ClientOptions) {
        super(options);
    }

    // Utility function to get the default account object (used to maintain a consistent account structure)
    get getDefaultAccount(): Account {
        return { claimed: 0, streak: 0, balance: 1_000 };
    }

    // Utility function to create a canvas, display graphics, and return the image as an attachment
    async canvas(width: number, height: number, fn: ({ ctx, width, height }: { ctx: CanvasRenderingContext2D, width: number, height: number }) => void | Promise<void>) {
        const canvas = new Canvas(width, height);
        const ctx = canvas.getContext('2d');
        await fn({ ctx, width, height });
        return { name: 'image.png', attachment: await canvas.toBuffer('png', { density: 2 } )};
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