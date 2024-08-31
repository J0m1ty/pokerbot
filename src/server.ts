import express from "express";
import { createServer } from "http";
import { ACK_TIMEOUT, DISCORD_VERIFIED_ROLE_ID, EMBED_COLOR, GUILD_ID, PORT } from "./config.js";
import { client } from "./client.js";
import { Verification } from "./structures.js";
import { ActionRowBuilder, APIMessageActionRowComponent, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { rules } from "./embeds/rules.js";

const app = express();

app.get('/verify', async (req, res) => {
    const id = req.query.id as string;
    const token = req.query.token as string;
    if (!id || !token) return res.status(400).send('Bad Request');

    const verification = await client.db.table('pending').get<Verification>(id);
    if (!verification || verification.step == "rules" || token !== verification.token) return res.status(400).send('Bad Request');

    const member = await client.member(id);
    if (!member) return res.status(404).send('Not Found');

    const buttonId = `verify-${id}-${Date.now()}`;

    const button = new ButtonBuilder()
        .setCustomId(buttonId)
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(button);

    const response = await member.send({ embeds: [ rules() ], components: [ row ] }).catch(() => {});
    if (!response) return res.status(500).send('Internal Server Error');

    await client.db.table('pending').set<Verification>(id, {
        step: "rules", 
        email: verification.email,
        buttonId
    });
    
    res.send('Email verified! You can now close this tab. Please check your DMs for the next steps.');
});

export const server = () => {
    return new Promise<void>(resolve => {
        createServer(app).listen(PORT, () => {
            console.log(`Server listening on port :${PORT}`);
            resolve();
        });
    });
}