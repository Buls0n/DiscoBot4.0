const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
client.login(process.env.TOKEN);

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
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Bot is ready to serve in ${client.guilds.cache.size} servers`);
  client.user.setActivity(config.activity);
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
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
console.log(`Loading ${commandFiles.length} commands...`);

for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`Loaded command: ${command.name}`);
  } catch (error) {
    console.error(`Error loading command ${file}:`, error);
  }
}

// Help command is loaded from commands directory

// Login to Discord with your client's token
client.login(config.token)
  .then(() => console.log('Bot logged in successfully'))
  .catch(error => console.error('Failed to log in:', error));
