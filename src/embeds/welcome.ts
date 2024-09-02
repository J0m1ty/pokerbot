import { EmbedBuilder } from "discord.js";
import { urls } from "../data/urls.js";

export const welcome = (username: string) => new EmbedBuilder()
    .setAuthor({
        name: 'RIT Poker Club',
        iconURL: urls.guildIcon
    })
    .setTitle('Welcome to RIT\'s Poker Club!')
    .setColor(Number(process.env.COLOR))
    .setThumbnail(urls.thumbnail)
    .setDescription(`Welcome, ${username}! RIT's Poker Club is supportive and educational place for people of all skill levels, from new players to experienced poker experts! We host frequent events and provide lots of resources to help you improve your poker game.\n\n**Let's start by getting you verified!**\nSend your _RIT email address_ in this DM and we'll send you a verification email.`)
    .setTimestamp();