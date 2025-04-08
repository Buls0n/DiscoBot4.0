// Command to display bot information and help
module.exports = {
  name: 'help',
  description: 'Displays a list of available commands',
  execute(message, args) {
    const prefix = process.env.PREFIX || '!';
    
    let helpText = '🎵 **Discord Music Bot Commands** 🎵\n\n';
    
    helpText += `**${prefix}play <url or title>** - Plays a song from YouTube by URL or search query\n`;
    helpText += `**${prefix}skip** - Skips the currently playing track\n`;
    helpText += `**${prefix}search <title>** - Searches YouTube for songs matching the query\n`;
    helpText += `**${prefix}queue** - Displays the current song queue\n`;
    helpText += `**${prefix}nightcore** - Toggles the nightcore effect (increased pitch/speed)\n`;
    helpText += `**${prefix}eq [bass] [mid] [treble]** - Adjusts equalizer settings (-10 to 10)\n`;
    helpText += `**${prefix}stop** - Stops playback and disconnects from voice channel\n`;
    helpText += `**${prefix}help** - Shows this help message\n\n`;
    
    helpText += '**How to use:**\n';
    helpText += '1. Join a voice channel\n';
    helpText += `2. Use ${prefix}play command with a YouTube URL or search term\n`;
    helpText += '3. Enjoy your music!\n\n';
    
    helpText += '**Note:** The bot requires permissions to join and speak in voice channels.';
    
    message.channel.send(helpText);
  }
};
