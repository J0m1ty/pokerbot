import { BaseInteraction } from "discord.js";
import { Event, Verification } from "../structures.js";
import { client } from "../client.js";
import { DISCORD_VERIFIED_ROLE_ID } from "../config.js";

const event: Event = {
    name: 'interactionCreate',
    async execute(interaction: BaseInteraction) {
        if (!interaction.isButton()) return;

        console.log(interaction.customId);

        const verification = await client.db.table('pending').get<Verification>(interaction.user.id);
        if (!verification || verification.step != "rules") return;
        console.log(verification);

        if (interaction.customId != verification.buttonId) return;

        const member = await client.member(interaction.user.id);
        if (!member) return;

        const role = await client.role(DISCORD_VERIFIED_ROLE_ID);
        if (!role) return;

        let success = true;
        await member.roles.add(role).catch(() => { success = false; });

        if (!success) {
            await interaction.reply({ content: 'There was an error! Please try again later.', ephemeral: true }).catch(() => {});
            return;
        }

        await interaction.message.edit({ components: [] }).catch(() => {});

        await member.send('Welcome to the server!').catch(() => {});

        client.db.table('pending').delete(interaction.user.id);
        client.db.set('verified', [...(await client.db.get<string[]>('verified') ?? []), interaction.user.id]);
    }
}

export default event;