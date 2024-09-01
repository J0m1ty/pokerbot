import { EmbedBuilder } from "discord.js";
import { EMBED_COLOR } from "../config/constants.js";

export const balance = (username: string, balance: number) => new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle(`${username}'s Balance`)
    .setDescription(`You have $${Math.floor(balance).toLocaleString()} in your account.`)
    .setTimestamp();