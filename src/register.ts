import { REST, Routes } from 'discord.js';
import { Command, Scope } from './structures.js';
import { load } from './gateway.js';
import { CLIENT_ID, GUILD_ID, TOKEN } from './config/discord.js';

const scopes: { [key in Scope]: any[] } = { dm: [], guild: [] };

await load('commands', (command: Command) => {
    scopes[command.scope] = [ ...(scopes[command.scope] ?? []), command.data.toJSON() ];
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

for (const scope in scopes) {
    try {
        const display = scope === 'dm' ? 'global' : 'guild';
        
        process.stdout.write(`Started refreshing ${scopes[scope].length} ${display} application (/) commands.`);

        const data = await rest.put(
            scope === 'dm' ? Routes.applicationCommands(CLIENT_ID) : Routes.applicationGuildCommands(CLIENT_ID, scope === 'guild' ? GUILD_ID : scope),
            { body: scopes[scope] }
        );
        
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(`Successfully refreshed ${(data as { length: number }).length} ${display} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}