const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, 
    PermissionFlagsBits 
} = require('discord.js');
const http = require('http');

// --- MINI SERVIDOR PARA O RENDER ---
http.createServer((req, res) => {
    res.write("Bot Online!");
    res.end();
}).listen(process.env.PORT || 3000); 
// -----------------------------------

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN; // Pegará das variáveis do Render

client.once('ready', () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
    client.application.commands.create({
        name: 'ticket',
        description: 'Envia o painel de suporte',
        defaultMemberPermissions: PermissionFlagsBits.Administrator,
    });
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'ticket') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 Central de Suporte')
            .setDescription('Clique no botão abaixo para abrir um ticket.')
            .setColor(0x5865F2);

        const botao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('abrir_ticket')
                .setLabel('Abrir Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );
        await interaction.reply({ embeds: [embed], components: [botao] });
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'abrir_ticket') {
            const nomeCanal = `ticket-${interaction.user.username}`;
            const canal = await interaction.guild.channels.create({
                name: nomeCanal,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                ],
            });

            const embedTicket = new EmbedBuilder()
                .setTitle('🎧 Suporte')
                .setDescription('Aguarde um moderador. Clique no botão para fechar.')
                .setColor(0x2ECC71);

            const botaoFechar = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('fechar_ticket')
                    .setLabel('Fechar Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

            await canal.send({ embeds: [embedTicket], components: [botaoFechar] });
            await interaction.reply({ content: `✅ Ticket criado: ${canal}`, ephemeral: true });
        }

        if (interaction.customId === 'fechar_ticket') {
            await interaction.reply('Fechando em 5 segundos...');
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    }
});

client.login(TOKEN);
