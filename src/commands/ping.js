import { SlashCommandBuilder } from 'discord.js';

const pingCommand = new SlashCommandBuilder().setName('ping').setDescription('機器人的延遲資訊');

export default pingCommand.toJSON();
