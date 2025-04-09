// Optimized bassboost.js with immediate effect application
const { getQueue } = require('../utils/musicUtils');
const { restartCurrentSongWithEffects } = require('../utils/audioEffects');

module.exports = {
  name: 'bassboost',
  description: 'Adjusts the bass level of the audio',
  async execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('I\'m not currently playing anything!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to use this command!');
    }
    
    // Default to medium if no argument is provided
    let level = args[0] ? args[0].toLowerCase() : 'medium';
    
    // Set bass level based on argument
    switch (level) {
      case 'off':
        queue.equalizer.bass = 0;
        break;
      case 'low':
        queue.equalizer.bass = 3;
        break;
      case 'medium':
        queue.equalizer.bass = 5;
        break;
      case 'high':
        queue.equalizer.bass = 8;
        break;
      case 'extreme':
        queue.equalizer.bass = 10;
        break;
      default:
        level = 'medium';
        queue.equalizer.bass = 5;
        message.reply('Invalid bass level! Using medium instead. Valid options: off, low, medium, high, extreme');
    }
    
    // Create rich embed for bass boost
    const embed = {
      color: 0xf39c12,
      title: '🔊 Bass Boost',
      description: `Bass boost set to **${level}**`,
      fields: [
        { name: 'Bass Level', value: `${queue.equalizer.bass}`, inline: true }
      ],
      footer: { text: `Requested by ${message.author.tag}` }
    };
    
    if (queue.currentSong && queue.currentSong.thumbnail) {
      embed.thumbnail = { url: queue.currentSong.thumbnail };
    }
    
    message.channel.send({ embeds: [embed] });
    
    // Apply effect immediately by restarting the current song with new settings
    message.channel.send('*Applying bass boost effect to current song...*');
    await restartCurrentSongWithEffects(queue);
  }
};
