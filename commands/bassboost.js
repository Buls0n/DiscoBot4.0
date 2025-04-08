// Command to apply bass boost effect
module.exports = {
  name: 'bassboost',
  description: 'Applies a bass boost effect to the audio',
  execute(message, args) {
    const { getQueue } = require('../utils/musicUtils');
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('There is no song currently playing!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to use this command!');
    }
    
    // Initialize bass boost level if not exists
    if (queue.bassBoostLevel === undefined) {
      queue.bassBoostLevel = 0;
    }
    
    // Parse arguments for bass boost level
    let level = 'medium';
    if (args.length > 0) {
      level = args[0].toLowerCase();
    }
    
    // Set bass boost based on level
    switch (level) {
      case 'off':
        queue.equalizer.bass = 0;
        queue.bassBoostLevel = 0;
        break;
      case 'low':
        queue.equalizer.bass = 3;
        queue.bassBoostLevel = 1;
        break;
      case 'medium':
        queue.equalizer.bass = 6;
        queue.bassBoostLevel = 2;
        break;
      case 'high':
        queue.equalizer.bass = 10;
        queue.bassBoostLevel = 3;
        break;
      default:
        return message.reply('Invalid bass boost level. Use: off, low, medium, or high');
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
    
    // Note about effect application
    message.channel.send('*Note: The bass boost will apply to the next song or when the current song is restarted.*');
  }
};
