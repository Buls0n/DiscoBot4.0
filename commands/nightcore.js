// Optimized nightcore.js with immediate effect application
const { getQueue } = require('../utils/musicUtils');
const { restartCurrentSongWithEffects } = require('../utils/audioEffects');

module.exports = {
  name: 'nightcore',
  description: 'Toggles the nightcore effect (increased pitch/speed)',
  async execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('I\'m not currently playing anything!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to use this command!');
    }
    
    // Toggle nightcore effect
    queue.nightcoreEnabled = !queue.nightcoreEnabled;
    
    // Notify user of the change
    const embed = {
      color: 0xf1c40f,
      title: '🎛️ Nightcore Effect',
      description: `Nightcore effect has been **${queue.nightcoreEnabled ? 'enabled' : 'disabled'}**!`,
      footer: { text: `Requested by ${message.author.tag}` }
    };
    
    if (queue.currentSong && queue.currentSong.thumbnail) {
      embed.thumbnail = { url: queue.currentSong.thumbnail };
    }
    
    message.channel.send({ embeds: [embed] });
    
    // Apply effect immediately by restarting the current song with new settings
    message.channel.send('*Applying nightcore effect to current song...*');
    await restartCurrentSongWithEffects(queue);
  }
};
