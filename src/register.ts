import { REST, Routes } from 'discord.js';
import { Command, Scope } from './structures.js';
import { load } from './gateway.js';
import { CLIENT_ID, GUILD_ID, TOKEN } from './config/discord.js';

const scopes: { [key in Scope]?: any[] } = { global: [], guild: [] };

await load('commands', (command: Command) => {
    const scope = command.scope == "guild" ? "guild" : "global";
    scopes[scope] = [ ...(scopes[scope] ?? []), command.data.toJSON() ];
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

for (const scope in scopes) {
    try {
        process.stdout.write(`Refreshing ${scopes[scope]!.length} ${scope} application (/) commands...`);

        const data = await rest.put(
            scope === 'guild' ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) : Routes.applicationCommands(CLIENT_ID),
            { body: scopes[scope] }
        );

        await new Promise(resolve => setTimeout(resolve, 500));
        
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(`Successfully refreshed ${(data as { length: number }).length} ${scope} application (/) commands.`);
    } catch {
        console.error(`Failed to refresh ${scope} application (/) commands.`);
    }
}