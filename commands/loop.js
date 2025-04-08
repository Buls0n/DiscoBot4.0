// Command to loop the current song or queue
module.exports = {
  name: 'loop',
  description: 'Toggles loop mode for the current song or entire queue',
  execute(message, args) {
    const { getQueue } = require('../utils/musicUtils');
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('There is no song currently playing!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to use this command!');
    }
    
    // Initialize loop mode if not exists
    if (!queue.loopMode) {
      queue.loopMode = 'none';
    }
    
    // Parse arguments for loop mode
    let mode = args[0]?.toLowerCase();
    
    // Toggle between modes if no argument provided
    if (!mode) {
      switch (queue.loopMode) {
        case 'none':
          queue.loopMode = 'song';
          break;
        case 'song':
          queue.loopMode = 'queue';
          break;
        case 'queue':
          queue.loopMode = 'none';
          break;
      }
    } else {
      // Set specific mode
      if (['none', 'off', 'disable'].includes(mode)) {
        queue.loopMode = 'none';
      } else if (['song', 'track', 'current'].includes(mode)) {
        queue.loopMode = 'song';
      } else if (['queue', 'all', 'playlist'].includes(mode)) {
        queue.loopMode = 'queue';
      } else {
        return message.reply('Invalid loop mode. Use: none, song, or queue');
      }
    }
    
    // Create rich embed for loop mode
    const embed = {
      color: 0x3498db,
      title: '🔄 Loop Mode',
      description: `Loop mode set to **${queue.loopMode}**`,
      footer: { text: `Requested by ${message.author.tag}` }
    };
    
    // Add icon based on mode
    let icon = '';
    switch (queue.loopMode) {
      case 'none':
        icon = '❌';
        embed.description = 'Loop mode **disabled**';
        break;
      case 'song':
        icon = '🔂';
        embed.description = 'Now looping the **current song**';
        break;
      case 'queue':
        icon = '🔁';
        embed.description = 'Now looping the **entire queue**';
        break;
    }
    
    embed.title = `${icon} Loop Mode`;
    
    if (queue.currentSong && queue.currentSong.thumbnail) {
      embed.thumbnail = { url: queue.currentSong.thumbnail };
    }
    
    message.channel.send({ embeds: [embed] });
  }
};
