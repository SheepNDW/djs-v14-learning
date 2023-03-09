import { Client, REST, Routes, SlashCommandBuilder, ChannelType } from 'discord.js';
import schedule from 'node-schedule';
import { config } from 'dotenv';

config();
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({ intents: [] });
const rest = new REST({ version: '10' }).setToken(TOKEN);

const handleScheduleCommand = (message, time, channel) => {
  const date = new Date(new Date().getTime() + time);

  channel.send({ content: `Your message has been scheduled for ${date.toLocaleTimeString()}` });

  schedule.scheduleJob(date, () => {
    channel.send({ content: message });
  });
};

/**
 * @param {import('discord.js').Interaction} interaction
 */
const handleInteractionCommand = (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'schedule') {
      // handle all the logic for schedule command.
      const message = interaction.options.getString('message');
      const time = interaction.options.getInteger('time');
      const channel = interaction.options.getChannel('channel');

      handleScheduleCommand(message, time, channel);

      interaction.reply({ content: `Your message has been scheduled successfully.` });
    }
  }
};

async function setupAndDeployCommands() {
  const command = [
    new SlashCommandBuilder()
      .setName('schedule')
      .setDescription('Schedules a message')
      .addStringOption((option) =>
        option
          .setName('message')
          .setDescription('The message to be schedule')
          .setMinLength(10)
          .setMaxLength(150)
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName('time')
          .setDescription('When to schedule the message')
          .setChoices(
            { name: '15 Seconds', value: 15000 },
            { name: '1 Minute', value: 60000 },
            { name: '15 Minutes', value: 900000 },
            { name: '30 Minutes', value: 1800000 },
            { name: '1 hour', value: 3600000 }
          )
          .setRequired(true)
      )
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('The channel the message should be sent to')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .toJSON(),
  ];

  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: command });
    client.on('ready', () => console.log(`Logged in as ${client.user?.tag}!`));
    client.on('interactionCreate', handleInteractionCommand);
    client.login(TOKEN);
  } catch (err) {
    console.error(err);
  }
}

setupAndDeployCommands();
