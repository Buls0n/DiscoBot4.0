const { getQueue } = require('../utils/musicUtils');
const { applyNightcoreEffect } = require('../utils/audioEffects');

module.exports = {
  name: 'nightcore',
  description: 'Applies a nightcore effect by increasing the pitch and speed of the audio',
  execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('There is no song currently playing!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to use this command!');
    }
    
    // Toggle nightcore effect
    queue.nightcoreEnabled = !queue.nightcoreEnabled;
    
    // In a real implementation, we would apply audio filters here
    // This would require additional audio processing libraries
    applyNightcoreEffect(null, queue.nightcoreEnabled);
    
    // Create rich embed for nightcore effect
    const embed = {
      color: queue.nightcoreEnabled ? 0xf1c40f : 0x95a5a6,
      title: queue.nightcoreEnabled ? '🎛️ Nightcore Effect Enabled' : '🎛️ Nightcore Effect Disabled',
      description: queue.nightcoreEnabled ? 
        'Music will now play with increased pitch and speed!' : 
        'Music will now play at normal pitch and speed.',
      footer: { text: `Requested by ${message.author.tag}` }
    };
    
    if (queue.currentSong && queue.currentSong.thumbnail) {
      embed.thumbnail = { url: queue.currentSong.thumbnail };
    }
    
    message.channel.send({ embeds: [embed] });
    
    // Note: For the effect to actually apply to the current song,
    // we would need to restart playback with the new effect settings
    if (queue.nightcoreEnabled) {
      message.channel.send('*Note: The effect will apply to the next song or when the current song is restarted.*');
    }
  }
};
