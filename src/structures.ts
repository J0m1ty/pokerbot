import { AutocompleteFocusedOption, AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, EmbedBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

// Card definitions
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king' | 'ace';
export type Card = `${Rank}_of_${Suit}`;

// Represents the current step of the '/learn' command
export type Step = {
    embed: EmbedBuilder;
    terms: Record<string, string>;
    isLastStep: boolean;
}

// Value type of the 'pending' table in the database
export type Verification = { email: string } & ({
    step: 'email';
    token: string;
} | {
    step: 'rules';
    buttonId: string;
});

// Player and table definitions
export type BlackjackAction = {
    type: 'hit' | 'stand' | 'double' | 'split';
} | {
    type: 'insurance';
    bet: number;
};

export type TexasHoldemAction = {
    action: 'check' | 'call' | 'fold';
} | {
    action: 'raise';
    amount?: number;
};

export type BasePlayer = {
    id: string;
    balance: number;
    inactivity: number;
    leaving: boolean;
    seat: number;
}

export type BlackjackPlayer = BasePlayer & {
    wager: number;
    queuedAction: BlackjackAction | null;
    insurenceBet: number;
    hands: {
        hand: [Card, Card];
        doubled: boolean;
    }[];
}

export type TexasHoldemPlayer = BasePlayer & {
    queuedAction: TexasHoldemAction | null;
    position: 'smallBlind' | 'bigBlind' | 'dealer' | null;
    hand?: [ Card, Card ];
}

// Value type of the 'tables' table in the database
export type Table = { 
    id: string;
    stakes: 'low' | 'medium' | 'high';
    turnDuration: number;
    cards: Card[];
 } & ({
    game: 'blackjack';
    players: BlackjackPlayer[];
    state: {
        phase: 'playing';
        dealerHand: [Card, Card];
        currentTurn: string;
        currentHand: number;
    } | {
        phase: 'waiting';
    }
    options: {
        decks: number;
        maxPlayers: number; // default is 7
        minBet: number;
        maxBet: number; // default is 25x min bet
    }
} | {
    game: 'texasholdem';
    players: TexasHoldemPlayer[];
    state: {
        phase: 'playing';
        communityCards: Card[];
        pots: {
            amount: number;
            players: string[];
        }[];
        currentTurn: string;
    } | {
        phase: 'waiting';
    }
    options: {
        maxPlayers: number; // default is 9
        smallBlind: number;
        bigBlind: number; // default is 2x small blind
        buyIn: number; // default is 50x big blind
    }
});

// Value type of the 'economy' table in the database
export type Account = {
    claimed: number;
    streak: number;
    balance: number;
}

// Command and event definitions
export type Scope = 'global' | 'dm' | 'guild' | (string & {});

export interface Command {
    scope: Scope;
    membership?: true;
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    autocompletes?: (focusedOption: AutocompleteFocusedOption, interaction: AutocompleteInteraction) => Promise<string[]>,
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface Event {
    name: keyof ClientEvents;
    once?: true;
    execute(...args: any[]): Promise<void>;
}