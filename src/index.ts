import { Command, Event } from "./structures.js";
import { load } from "./gateway.js";
import { TOKEN } from "./config.js";
import { listen } from "./server.js";
import { client } from "./client.js";

await listen();

await load('commands', (command: Command) => client.commands.set(command.data.name, command));

await load('events', (event: Event) => {
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

await client.login(TOKEN);