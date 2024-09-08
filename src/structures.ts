import { AutocompleteFocusedOption, AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, EmbedBuilder, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { TexasHoldemTableData } from "./texasholdem.js";
import { BlackjackTableData } from "./blackjack.js";

// Represents the current step of the '/learn' command
export type Step = {
    embed: EmbedBuilder;
    terms: Record<string, string>;
    isLastStep: boolean;
}

// Value type of the 'pending' table in the database
export type VerificationData = { email: string } & ({
    step: 'email';
    token: string;
} | {
    step: 'rules';
    buttonId: string;
});

// Value type of the 'tables' table in the database
export type TableData = BlackjackTableData | TexasHoldemTableData;

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