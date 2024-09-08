import { Event, VerificationData } from "../structures.js";
import { GuildMember } from "discord.js";
import { randomBytes } from 'crypto';
import { client } from "../client.js";
import { welcome } from "../embeds/welcome.js";

const event: Event = {
    name: 'guildMemberAdd',
    async execute(member: GuildMember) {
        if (member.user.bot) return;

        const list = await client.db.get<string[]>('verified') ?? [];

        const previous = list.includes(member.id);
        const current = member.roles.cache.has(process.env.VERIFIED_ROLE_ID ?? '');

        if (previous || current) {
            await member.send('You are already verified. Welcome back!').catch(() => {});

            if (previous && !current) {
                const role = await client.role(process.env.VERIFIED_ROLE_ID ?? '');
                if (!role) return;

                await member.roles.add(role).catch(() => {});
            }

            return;
        }

        const response = await member.send({ embeds: [ welcome(member.user.username) ] }).catch(() => {});
        if (!response) return;

        client.db.table('pending').set<VerificationData>(member.id, { 
            step: 'email', 
            email: '',
            token: randomBytes(32).toString('hex')
        });
    }
}

export default event;