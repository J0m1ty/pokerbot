import { PermissionFlagsBits } from "discord.js";
import { Event } from "../structures.js";
import { client } from "../client.js";
import { GUILD_ID, ROLE } from "../config/discord.js";

const event: Event = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (command.scope == "dm" && interaction.guildId) {
            await interaction.reply({ content: 'This command is only available in DMs.', ephemeral: true }).catch(() => {});
            return;
        }

        if (command.scope == "guild" && interaction.guildId != GUILD_ID) {
            await interaction.reply({ content: 'This command is only available within the RIT Poker Club server.', ephemeral: true }).catch(() => {});
            return;
        }

        if (command.membership) {
            const member = await client.member(interaction.user.id);
            if (!member) return;

            const membership = await client.role(ROLE.MEMBERSHIP);
            if (!membership) return;

            if (!member.roles.cache.has(membership.id) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({ content: 'You must be a club member to use this command!', ephemeral: true }).catch(() => {});
                return;
            }
        }

        command.execute(interaction).catch(async (error) => {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(() => {});
        });
    }
}

export default event;