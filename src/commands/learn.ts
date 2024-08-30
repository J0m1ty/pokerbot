import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, MessageActionRowComponentBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { Command } from "../structures.js";
import { th } from "../embeds/texasholdem.js";
import { bj } from "../embeds/blackjack.js";

export const generate = async (interaction: ChatInputCommandInteraction | ButtonInteraction, { game, step }: { game: string, step: number }) => {
    const { embed, terms, last } = game === 'texasholdem' ? th(step) : bj(step);

    const button = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`learn-${game}-${step}`)
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
        );

    const selectMenu = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`define-${game}-${step}`)
                .setPlaceholder('Need a term defined?')
                .addOptions(Object.keys(terms).map(term => new StringSelectMenuOptionBuilder().setLabel(term.replaceAll("_", " ")).setValue(term)))
        );

    const response = await interaction.reply({ embeds: [embed], components: [selectMenu, ...(last ? [] : [button])] }).catch(() => { });
    if (!response) return;

    const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

    collector.on('collect', async i => {
        if (i.user.id != interaction.user.id) {
            await i.reply({ content: 'This select menu is not for you!', ephemeral: true }).catch(() => { });
            return;
        }

        const game = i.customId.split('-')[1];
        const step = parseInt(i.customId.split('-')[2]);
        const { terms } = game === 'texasholdem' ? th(step) : bj(step);

        const term = i.values[0];
        const definition = terms[term];

        await i.reply({ content: `**${term.replaceAll("_", " ")}:** ${definition}`, ephemeral: true }).catch(() => { });
    });

    collector.on('end', async () => {
        await response.edit({ components: [] }).catch(() => { });
    });
}

const command: Command = {
    scope: 'dm',
    data: new SlashCommandBuilder()
        .setName('learn')
        .setDescription('Learn how to play various games')
        .addSubcommand(subcommand =>
            subcommand
                .setName('texasholdem')
                .setDescription('Learn how to play Texas Hold\'em')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('blackjack')
                .setDescription('Learn how to play Blackjack')
        ),
    async execute(interaction) {
        const game = interaction.options.getSubcommand();
        await generate(interaction, { game, step: 0 });
    }
}

export default command;