import { SlashCommandBuilder } from 'discord.js';

const channelsCommand = new SlashCommandBuilder()
  .setName('channels')
  .setDescription('channels cmd')
  .addChannelOption((option) =>
    option.setName('channels').setDescription('channels').setRequired(true)
  )
  .addBooleanOption((option) =>
    option.setName('deletemessages').setDescription('Delete the messages').setRequired(true)
  )
  .addIntegerOption((option) =>
    option.setName('age').setDescription('Enter your age').setRequired(true)
  )
  .addAttachmentOption((option) => option.setName('file').setDescription('file'));

export default channelsCommand.toJSON();
