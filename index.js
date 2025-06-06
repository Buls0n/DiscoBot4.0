const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // For loading environment variables

// Initialize cookie manager
const cookieManager = require('./utils/cookieUtils');

// Create temp directory
require('./utils/setupTemp');

// Load config, with fallback for environment variables
let config;
try {
  config = require('./config.json');
} catch (error) {
  console.log('No config.json found, using environment variables');
  config = {
    prefix: process.env.PREFIX || '!',
    activity: process.env.ACTIVITY || '!help | Music'
  };
}

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Initialize collections
client.commands = new Collection();
client.queues = new Map();

// When the client is ready, run this code
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is ready to serve in ${client.guilds.cache.size} servers`);
  client.user.setActivity(config.activity);
  
  // Initialize cookies from environment variable
  const cookiesInitialized = await cookieManager.initFromEnvironment();
  if (cookiesInitialized) {
    console.log('YouTube cookies initialized successfully');
  } else {
    console.log('No YouTube cookies found in environment variables');
    console.log('Some YouTube videos may not be accessible without authentication');
  }
});

// Command handler
client.on('messageCreate', async message => {
  // Ignore messages from bots or messages that don't start with the prefix
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  // Parse command and arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check if command exists
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    // Execute command
    command.execute(message, args);
  } catch (error) {
    console.error(`Error executing ${commandName} command:`, error);
    message.reply('There was an error trying to execute that command!');
  }
});

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

// Load commands
console.log('Loading commands...');
try {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  console.log(`Found ${commandFiles.length} command files`);

  for (const file of commandFiles) {
    try {
      const command = require(`./commands/${file}`);
      client.commands.set(command.name, command);
      console.log(`Loaded command: ${command.name}`);
    } catch (error) {
      console.error(`Error loading command ${file}:`, error);
    }
  }
} catch (error) {
  console.error('Error loading commands directory:', error);
}

// Help command is loaded from commands directory

// Login to Discord with your client's token (using environment variable or config file)
const token = process.env.TOKEN || config.token;
if (!token) {
  console.error('No token provided! Set TOKEN environment variable or add token to config.json');
  process.exit(1);
}

console.log('Attempting to log in...');
client.login(token)
  .then(() => console.log('Bot logged in successfully'))
  .catch(error => {
    console.error('Failed to log in:', error);
    process.exit(1);
  });
