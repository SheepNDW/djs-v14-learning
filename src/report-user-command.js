import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { config } from 'dotenv';

config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', () => console.log(`Logged in as ${client.user?.tag}!`));

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isUserContextMenuCommand()) return;

  if (interaction.commandName === 'Report') {
    const reportInput = new TextInputBuilder()
      .setCustomId('reportMessage')
      .setLabel('Report Message')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(500);

    const actionRow = new ActionRowBuilder().addComponents(reportInput);

    const modal = new ModalBuilder()
      .setCustomId('reportUserModal')
      .setTitle('Report a User')
      .addComponents(actionRow);

    await interaction.showModal(modal);
    try {
      const modalSubmitInteraction = await interaction.awaitModalSubmit({
        filter: (i) => i.customId === 'reportUserModal',
        time: 120_000,
      });

      console.log(`${modalSubmitInteraction.customId} was submitted!`);
      console.log('user: ', interaction.user.tag);
      console.log('target user: ', interaction.targetUser.tag);

      modalSubmitInteraction.reply({
        content: `Thank you for reporting ${
          interaction.targetMember
        }. Reason: ${modalSubmitInteraction.fields.getTextInputValue('reportMessage')}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  }
});

const command = [
  {
    name: 'Report',
    type: 2,
  },
];

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: command });

  client.login(TOKEN);
} catch (error) {
  console.error(error);
}
