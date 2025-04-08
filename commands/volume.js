// Command to adjust volume of playback
module.exports = {
  name: 'volume',
  description: 'Adjusts the volume of the music playback',
  execute(message, args) {
    const { getQueue } = require('../utils/musicUtils');
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('There is no song currently playing!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to adjust the volume!');
    }
    
    if (!args.length) {
      // Display current volume
      const embed = {
        color: 0x3498db,
        title: '🔊 Current Volume',
        description: `The current volume is set to **${queue.volume * 100}%**`,
        footer: { text: 'Use !volume <1-200> to adjust the volume' }
      };
      
      if (queue.currentSong && queue.currentSong.thumbnail) {
        embed.thumbnail = { url: queue.currentSong.thumbnail };
      }
      
      return message.channel.send({ embeds: [embed] });
    }
    
    const volume = parseInt(args[0]);
    
    // Validate input
    if (isNaN(volume)) {
      return message.reply('Please provide a valid number for the volume.');
    }
    
    if (volume < 1 || volume > 200) {
      return message.reply('Volume must be between 1 and 200.');
    }
    
    // Update volume
    const newVolume = volume / 100;
    queue.volume = newVolume;
    
    // Create rich embed for volume adjustment
    const embed = {
      color: 0x3498db,
      title: '🔊 Volume Adjusted',
      description: `Volume has been set to **${volume}%**`,
      footer: { text: `Adjusted by ${message.author.tag}` }
    };
    
    if (queue.currentSong && queue.currentSong.thumbnail) {
      embed.thumbnail = { url: queue.currentSong.thumbnail };
    }
    
    message.channel.send({ embeds: [embed] });
    
    // Note: For the volume to actually apply to the current song,
    // we would need to restart playback with the new volume settings
    message.channel.send('*Note: The volume change will apply to the next song or when the current song is restarted.*');
  }
};
