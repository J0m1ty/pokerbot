import { EmbedBuilder } from "discord.js";
import { EMBED_COLOR } from "../config/discord.js";

export const rules = () => new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('RIT Poker Club Rules')
    .setDescription('Please follow the rules to ensure a positive community experience.')
    .addFields(
        { name: '1. Respect', value: 'Be kind and respectful to everyone.' },
        { name: '2. No Hate Speech', value: 'Discriminatory or hateful comments are not allowed.' },
        { name: '3. No Spamming', value: 'Avoid spamming in the channels.' },
        { name: '4. Keep it Appropriate', value: 'Inappropriate content is prohibited.' },
        { name: '5. Stay On-Topic', value: 'Keep discussions relevant to the designated channels.' },
        { name: '6. No Cash Games', value: 'Do not organize cash games or paid buy-in games through this server.' },
        { name: '7. Update Your Nickname', value: 'After verification, change your nickname to your preferred real-life name.' },
        { name: '8. Follow RIT Rules', value: 'Follow all RIT rules and the code of conduct.' },
        { name: '9. Be Positive', value: 'Be a positive and fun member of the community.' },
    )
    .setTimestamp();