import { Command, Event } from "./structures.js";
import { load } from "./gateway.js";
import { TOKEN } from "./config.js";
import { server } from "./server.js";
import { client } from "./client.js";

await server();

await load('commands', (command: Command) => client.commands.set(command.data.name, command));

await load('events', (event: Event) => {
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

await client.db.init();

await client.login(TOKEN);