import { EmbedBuilder } from "discord.js";
import { EMBED_COLOR, GUILD_ICON_URL, THUMBNAIL_URL } from "../config.js";

export const welcome = (username: string) => new EmbedBuilder()
    .setAuthor({
        name: 'RIT Poker Club',
        iconURL: GUILD_ICON_URL
    })
    .setTitle('Welcome to RIT\'s Poker Club!')
    .setColor(EMBED_COLOR)
    .setThumbnail(THUMBNAIL_URL)
    .setDescription(`Welcome, ${username}! RIT's Poker Club is supportive and educational place for people of all skill levels, from new players to experienced poker experts! We host frequent events and provide lots of resources to help you improve your poker game.\n\n**Let's start by getting you verified!**\nSend your _RIT email address_ in this DM and we'll send you a verification email.`)
    .setTimestamp();