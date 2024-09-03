import { AutocompleteFocusedOption, AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, EmbedBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export type Verification = { email: string } & ({
    step: 'email';
    token: string;
} | {
    step: 'rules';
    buttonId: string;
});

export type Table = { id: string } & ({
    game: 'blackjack';
    decks: number;
    maxPlayers: number;
    minBet: number;
    maxBet: number | null;
} | {
    game: 'texasholdem';
});

export type Account = {
    claimed: number;
    streak: number;
    balance: number;
}

export type Scope = 'global' | 'dm' | 'guild' | (string & {});

export type Step = {
    embed: EmbedBuilder;
    terms: Record<string, string>;
    last: boolean;
}

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