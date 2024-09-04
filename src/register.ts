import { REST, Routes } from 'discord.js';
import { Command, Scope } from './structures.js';
import { load } from './gateway.js';
import 'dotenv/config';

// 'scopes' holds both global and guild-specific commands
const scopes: { [ key: string ]: any[] } = { global: [], guild: [] };

// Load all commands in the '/commands' directory
await load('commands', (command: Command) => {
    const scope = command.scope == "guild" ? "guild" : "global";
    scopes[scope] = [ ...(scopes[scope] ?? []), command.data.toJSON() ];
});

// Create a REST client and login with the bot's token
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN ?? '');

// Refresh all commands
for (const scope in scopes) {
    try {
        process.stdout.write(`Refreshing ${scopes[scope]!.length} ${scope} application (/) commands...`);

        // Tell Discord our slash commands
        const data = await rest.put(
            scope === 'guild' ? Routes.applicationGuildCommands(process.env.CLIENT_ID ?? '', process.env.GUILD_ID ?? '') : Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
            { body: scopes[scope] }
        );

        // Wait 500ms before refreshing the next set of commands
        await new Promise(resolve => setTimeout(resolve, 500));
        
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(`Successfully refreshed ${(data as { length: number }).length} ${scope} application (/) commands.`);
    } catch {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.error(`Failed to refresh ${scope} application (/) commands.`);
    }
}