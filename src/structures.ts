import { AutocompleteFocusedOption, AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, EmbedBuilder, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export type Verification = { email: string } & ({
    step: 'email';
    token: string;
} | {
    step: 'rules';
    buttonId: string;
});

export type Scope = 'dm' | 'guild' | (string & {});

export type Step = {
    embed: EmbedBuilder;
    terms: Record<string, string>;
    last: boolean;
}

export interface Command {
    scope: Scope;
    membership?: true;
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    autocompletes?: (focusedOption: AutocompleteFocusedOption, interaction: AutocompleteInteraction) => Promise<string[]>,
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface Event {
    name: keyof ClientEvents;
    once?: true;
    execute(...args: any[]): Promise<void>;
}