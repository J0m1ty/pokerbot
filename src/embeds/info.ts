import { EmbedBuilder } from "discord.js";
import { urls } from "../data/urls.js";

export const info = (game: 'blackjack' | 'texasholdem', stakes: string, name: string, players: number, max: number, settings: { [key: string]: string }) => new EmbedBuilder()
    .setColor(Number(process.env.COLOR))
    .setThumbnail(game == 'blackjack' ? urls.blackjack : urls.texasholdem)
    .setTitle(`${name.charAt(0).toUpperCase()}${name.slice(1).replace('-', ' #')} Table`)
    .setDescription(`A ${stakes}-stakes ${game == 'blackjack' ? 'a Blackjack' : 'a Texas Hold\'em'} table.\n\`${max - players}/${max}\` seats are available.\n\n`
        + `__**Table information:**__\n`
        + Object.entries(settings).reduce((acc, [name, value]) => acc + `**${name.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())}:** \`${value}\`\n`, '')
    );