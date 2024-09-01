import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, SlashCommandSubcommandBuilder, TextChannel } from "discord.js";
import { Command } from "../structures.js";
import { client } from "../client.js";
import { EMBED_COLOR } from "../config/constants.js";

const command: Command = {
    scope: 'guild',
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a message to the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('plain')
                .setDescription('Send a plain text message.')
                .addStringOption(option => option.setName('message').setDescription('The message content to send.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed')
                .setDescription('Send an embed message.')
                .addStringOption(option => option.setName('title').setDescription('The title of the embed.').setRequired(false))
                .addStringOption(option => option.setName('description').setDescription('The description of the embed.').setRequired(false))
                .addStringOption(option => option.setName('image').setDescription('The image URL of the embed.').setRequired(false))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        const channel = await client.channel(interaction.channelId);
        if (!channel || !(channel instanceof TextChannel)) return;

        let success = true;
        switch (subcommand) {
            case 'plain':
                const message = interaction.options.getString('message', true);

                await channel.send(message).catch(() => { success = false; });
                break;
            case 'embed': 
                const title = interaction.options.getString('title');
                const description = interaction.options.getString('description');
                const image = interaction.options.getString('image');

                const embed = new EmbedBuilder().setColor(EMBED_COLOR);

                if (title) embed.setTitle(title);
                
                if (description) embed.setDescription(description.split('\\n').join('\n'));

                if (image) embed.setThumbnail(image);

                await channel.send({ embeds: [ embed ] }).catch(() => { success = false; });
                break;
        }

        await interaction.reply({ content: success ? 'Message sent!' : 'There was an error while sending the message.', ephemeral: true }).catch(() => {});
    },
}

export default command;