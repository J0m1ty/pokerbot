import { AutocompleteFocusedOption, AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, EmbedBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

// Card definitions
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type Card = `${Rank} of ${Suit}`;

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
export type History = {
    hand: [ Card, Card ];
    change: number;
    outcome: 'win' | 'lose' | 'push' | 'fold';
}

export type BasePlayer = {
    id: string;
    balance: number;
    history: History[];
    leaving: boolean;
}

export type BlackjackPlayer = BasePlayer & {
    wager: number;
    hand?: [ Card, Card ];
    insuranceBet?: number;
    status?: 'playing' | 'stood' | 'busted' | 'doubled' | 'split';
    splitHands?: {
        hand: [Card, Card];
        wager: number;
        status: 'playing' | 'stood' | 'busted' | 'doubled';
    }[];
}

export type TexasHoldemPlayer = BasePlayer & {
    seat: number;
    firstHand?: boolean; // players must bet the big blind on their first hand
    hand?: [ Card, Card ];
    action?: 'folded' | 'checked' | 'called' | 'raised' | 'all-in';
    position?: 'smallBlind' | 'bigBlind' | 'dealer';
}

// Value type of the 'tables' table in the database
export type Table = { id: string, stakes: 'low' | 'medium' | 'high' } & ({
    game: 'blackjack';
    players: BlackjackPlayer[];
    state: {
        dealerHand?: [Card, Card];
        currentTurn?: string;
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
        communityCards?: Card[];
        pots?: {
            amount: number;
            players: string[];
        }[];
        phase?: 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
        currentTurn?: string;
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