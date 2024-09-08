import { BlackjackTable } from "./blackjack.js";
import { TexasHoldemTable } from "./texasholdem.js";

export const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'] as const;

export type Suit = typeof suits[number];
export type Rank = typeof ranks[number];
export type Card = `${Rank}_of_${Suit}`;

export type BasePlayer = {
    id: string;
    balance: number;
    inactivity: number;
    playing: boolean;
    leaving: false | 'insufficient' | 'afk' | 'manual';
    seat: number;
}

export interface BaseTable {
    id: string;
    stakes: 'low' | 'medium' | 'high';
    turnDuration: number;
    cards: Card[];
}

export type Table = BlackjackTable | TexasHoldemTable;