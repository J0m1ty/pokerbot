import { Event, VerificationData } from "../structures.js";
import { Message } from "discord.js";
import { sendEmail } from "../email.js";
import { client } from "../client.js";

const event: Event = {
    name: 'messageCreate',
    async execute(message: Message) {
        if (message.author.bot || message.guild) return;
        
        if (message.content.match(/^[a-zA-Z0-9._%+-]+@(?:g\.)?rit\.edu$/)) {
            const verification = await client.db.table('pending').get<VerificationData>(message.author.id);
            if (!verification || verification.step == "rules") return;
            
            const success = await sendEmail(message.content, 'RIT Poker Club Verification', `Hello, ${message.author.username}! Click the following link to verify your email address: https://jomity.net/verify?id=${message.author.id}&token=${verification.token}\nIf you did not request this email, please ignore it.`);

            await client.db.table('pending').set<VerificationData>(message.author.id, {
                ...verification,
                email: message.content
            });

            await message.author.send({
                content: success ? 'Email sent! Check your spam folder.' : 'There was an error sending the verification email. Please try again later.'
            }).catch(() => {});
        }
    }
}

export default event;