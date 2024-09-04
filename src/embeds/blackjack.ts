import { EmbedBuilder } from "discord.js";
import { Step } from "../structures.js";
import { urls } from "../data/urls.js";

export const bj = (step: number): Step => {
    const out: Step = step == 0 ? {
        embed: new EmbedBuilder()
            .setTitle('Blackjack: Introduction & Goal')
            .setDescription('Welcome to Blackjack! The goal of Blackjack is to beat the dealer by having a hand value as close to 21 as possible without going over. It\'s a game of skill, strategy, and a bit of luck.'),
        terms: {
            "Hand_Value": "The total value of the cards in your hand.",
            "Bust": "When the total hand value exceeds 21, resulting in an automatic loss."
        },
        isLastStep: false
    } : step == 1 ? {
        embed: new EmbedBuilder()
            .setTitle('Blackjack: The Basics & Setup')
            .setDescription('Each round, players start by placing their bets. Then, each player is dealt two cards, and the dealer is dealt one card face up and one card face down. Number cards are worth their face value (e.g. an 8 is worth 8), face cards are worth 10, and Aces can be worth 1 or 11.'),
        terms: {
            "Face_Cards": "The Jack, Queen, and King, each worth 10 points.",
            "Ace": "A card that can be worth 1 or 11, depending on which is more favorable to the hand."
        },
        isLastStep: false
    } : step == 2 ? {
        embed: new EmbedBuilder()
            .setTitle('Blackjack: Gameplay Actions')
            .setDescription('Players have several options on their turn: **Hit**, **Stand**, **Double Down**, or **Split**. Hitting means taking another card, standing means keeping your current hand, doubling down allows you to double your bet for one more card, and splitting is only possible if you have two cards of the same value.'),
        terms: {
            "Hit": "Take another card to increase your hand value.",
            "Stand": "Keep your current hand and end your turn.",
            "Double_Down": "Doubling your bet for the opportunity to receive exactly one more card.",
            "Split": "Splitting your hand into two separate hands, only when dealt two of the same card."
        },
        isLastStep: false
    } : {
        embed: new EmbedBuilder()
            .setTitle('Blackjack: Winning & Payouts')
            .setDescription('If your hand is closer to 21 than the dealer\'s hand, you win and double your bet! If your hand goes over 21, you bust and lose your bet. If you and the dealer have the same hand value, it\'s a push, and you get your bet back. Blackjack (an Ace and a 10-value card) pays 3:2.'),
        terms: {
            "Push": "A tie between the player and the dealer, resulting in the player getting their bet back.",
            "Blackjack": "An automatic win with a hand value of 21, consisting of an Ace and a 10-value card, paying 3:2."
        },
        isLastStep: true
    }

    out.embed
        .setThumbnail(urls.blackjack)
        .setColor(Number(process.env.COLOR));

    return out;
}
