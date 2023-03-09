import { config } from 'dotenv';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

/* Commands */
import {
  BanCommand,
  ButtonCommand,
  ChannelsCommand,
  OrderCommand,
  PingCommand,
  RegisterCommand,
  RolesCommand,
  UsersCommand,
} from './commands/index.js';

config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', () => console.log(`Logged in as ${client.user?.tag}!`));

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('button1').setLabel('Button 1').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('button2').setLabel('Button 2').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel('Google Search')
      .setStyle(ButtonStyle.Link)
      .setURL('https://www.google.com.tw/')
  );

  message.channel.send({
    content: 'Hello Happy World!',
    components: [row],
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ping') {
    const msg = await interaction.reply({
      content: '正在計算延遲...',
      fetchReply: true,
    });
    const ping = msg.createdTimestamp - interaction.createdTimestamp;
    interaction.editReply(`機器人延遲：${ping} ms`);
  } else if (interaction.commandName === 'order') {
    const actionRawComponent = new ActionRowBuilder().setComponents(
      new StringSelectMenuBuilder().setCustomId('food_options').setOptions([
        { label: 'Cake', value: 'cake' },
        { label: 'Pizza', value: 'pizza' },
        { label: 'Sushi', value: 'sushi' },
      ])
    );
    const actionRowDrinkMenu = new ActionRowBuilder().setComponents(
      new StringSelectMenuBuilder().setCustomId('drink_options').setOptions([
        { label: 'Orange Juice', value: 'orange_juice' },
        { label: 'Coca-Cola', value: 'coca_cola' },
      ])
    );
    interaction.reply({
      components: [actionRawComponent.toJSON(), actionRowDrinkMenu.toJSON()],
    });
  } else if (interaction.commandName === 'register') {
    const modal = new ModalBuilder()
      .setTitle('Register User Form')
      .setCustomId('registerUserModal')
      .setComponents(
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel('username')
            .setCustomId('username')
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel('email')
            .setCustomId('email')
            .setStyle(TextInputStyle.Short)
        ),
        new ActionRowBuilder().setComponents(
          new TextInputBuilder()
            .setLabel('comment')
            .setCustomId('comment')
            .setStyle(TextInputStyle.Paragraph)
        )
      );

    interaction.showModal(modal);
  } else if (interaction.commandName === 'button') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('button1').setLabel('Button 1').setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('button2')
        .setLabel('Button 2')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel('Google Search')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.google.com.tw/')
    );

    interaction.reply({ content: 'Button!', components: [row] });
  }
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;
  console.log('Select Menu');
  if (interaction.customId === 'food_options') {
    interaction.reply({ content: interaction.values[0] });
  } else if (interaction.customId === 'drink_options') {
    interaction.reply({ content: interaction.values[0] });
  }
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  console.log('Modal submitted...');
  if (interaction.customId === 'registerUserModal') {
    const username = interaction.fields.getTextInputValue('username');
    const email = interaction.fields.getTextInputValue('email');
    const comment = interaction.fields.getTextInputValue('comment');
    console.table({ username, email, comment });
    interaction.reply({
      content: 'You successfully submitted your details!',
    });
  }
});

client.on('interactionCreate', (interaction) => {
  if (!interaction.isUserContextMenuCommand()) return;

  switch (interaction.commandName) {
    case 'Report':
      console.log(interaction.targetMember);
      interaction.reply({ content: `You reported ${interaction.targetMember}` });
      break;
    case 'Wave':
      console.log(interaction.targetMember);
      interaction.reply({ content: `You waved to ${interaction.targetMember}` });
      break;
    default:
      throw new Error('invalid command name');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isMessageContextMenuCommand) return;

  console.log(interaction.targetMessage);
});

client.on('interactionCreate', (interaction) => {
  if (!interaction.isButton()) return;
  console.log(interaction.customId);
  interaction.reply({ content: 'Thanks for clicking on the button!' });
});

async function main() {
  const commands = [
    OrderCommand,
    PingCommand,
    RolesCommand,
    UsersCommand,
    ChannelsCommand,
    BanCommand,
    RegisterCommand,
    ButtonCommand,
    {
      name: 'Wave',
      type: 2,
    },
    {
      name: 'Report',
      type: 2,
    },
    {
      name: 'Report Message',
      type: 3,
    },
  ];

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

    client.login(TOKEN);
  } catch (error) {
    console.error(error);
  }
}

main();
