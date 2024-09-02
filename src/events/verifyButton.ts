import { Event, Verification } from "../structures.js";
import { client } from "../client.js";
import { generate } from "../commands/learn.js";
import { ROLE } from "../config/discord.js";

const event: Event = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('verify-')) return;

        const verification = await client.db.table('pending').get<Verification>(interaction.user.id);
        if (!verification || verification.step != "rules") return;

        if (interaction.customId != verification.buttonId) return;

        const member = await client.member(interaction.user.id);
        if (!member) return;

        const role = await client.role(ROLE.VERIFIED);
        if (!role) return;

        let success = true;
        await member.roles.add(role).catch(() => { success = false; });

        if (!success) {
            await interaction.reply({ content: 'There was an error! Please try again later.', ephemeral: true }).catch(() => { });
            return;
        }

        await interaction.message.edit({ components: [] }).catch(() => { });

        await member.send('Welcome to the server! You now have access to all channels.').catch(() => { });

        const email = verification.email.replace('.', '');
        await client.db.table('emails').set<string[]>(email, [...(await client.db.table('emails').get<string[]>(email) ?? []), interaction.user.id]);
        await client.db.table('pending').delete(interaction.user.id);
        await client.db.set('verified', [...(await client.db.get<string[]>('verified') ?? []), interaction.user.id]);
    }
}

export default event;