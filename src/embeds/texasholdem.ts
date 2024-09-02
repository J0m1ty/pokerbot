import { EmbedBuilder } from "discord.js";
import { Step } from "../structures.js";
import { urls } from "../data/urls.js";

export const th = (step: number): Step => {
    const out: Step = step == 0 ? {
        embed: new EmbedBuilder()
            .setTitle('Texas Hold\'em: Introduction & Goal')
            .setDescription('Welcome to Texas Hold\'em, one of the most popular forms of poker! The goal of Texas Hold\'em is simple: win chips by forming the best possible 5-card hand, or by convincing other players to fold, leaving you as the last one standing.'),
        terms: {
            "Chips": "The currency used in poker games to place bets.",
            "Hand": "The combination of cards a player has.",
            "Fold": "To give up the current round, forfeiting any claim to the pot."
        },
        last: false
    } : step == 1 ? {
        embed: new EmbedBuilder()
            .setTitle('Texas Hold\'em: The Basics & Setup')
            .setDescription('In Texas Hold\'em, each player is dealt two private cards, known as **hole cards**. Five community cards are then dealt face up in three stages: **the Flop** (3 cards), **the Turn** (1 card), and **the River** (1 card). Players use these cards to form the best possible hand.'),
        terms: {
            "Hole_Cards": "The two private cards dealt to each player at the start of a round.",
            "The_Flop": "The first three community cards dealt face up.",
            "The_Turn": "The fourth community card dealt face up.",
            "The_River": "The fifth and final community card dealt face up."
        },
        last: false
    } : step == 2 ? {
        embed: new EmbedBuilder()
            .setTitle('Texas Hold\'em: How to Play a Round')
            .setDescription('Each round of Texas Hold\'em consists of four stages: **Pre-flop**, **Flop**, **Turn**, and **River**. Betting occurs at each stage. Players can choose to **check**, **bet**, **call**, **raise**, or **fold**. The round ends with a **showdown**, where the best hand wins.'),
        terms: {
            "Pre-flop": "The first round of betting before the flop is dealt.",
            "Check": "To pass the action to the next player without betting.",
            "Bet": "To wager chips, forcing other players to match to stay in the hand.",
            "Call": "To match the current bet.",
            "Raise": "To increase the current bet.",
            "Showdown": "The final stage where players reveal their hands to determine the winner."
        },
        last: false
    } : {
        embed: new EmbedBuilder()
            .setTitle('Texas Hold\'em: Betting & Strategy')
            .setDescription('Betting is a crucial part of Texas Hold\'em. Players can choose to be aggressive or conservative depending on their cards and strategy. Bluffing, or pretending to have a strong hand when you don\'t, is a common tactic. Understanding **pot odds** and **position** can give you an advantage over your opponents.'),
        terms: {
            "Bluffing": "Pretending to have a better hand than you actually do.",
            "Pot_Odds": "The ratio of the current size of the pot to the cost of a contemplated call.",
            "Position": "The order in which players act during a round, which can influence strategy."
        },
        last: true
    }
    out.embed
        .setThumbnail(urls.texasHoldem)
        .setColor(Number(process.env.COLOR));

    return out;
}