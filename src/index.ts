import { Command, Event } from "./structures.js";
import { load } from "./gateway.js";
import { server } from "./server.js";
import { client } from "./client.js";
import 'dotenv/config';

// Start the web server (for reciving verification tokens)
await server();

// Load slash command handlers
await load('commands', (command: Command) => client.commands.set(command.data.name, command));

// Load event handlers
await load('events', (event: Event) => {
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

// Ready the database
await client.db.init();

// Login to Discord
await client.login(process.env.TOKEN ?? '');