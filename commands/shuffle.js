// Command to shuffle the current queue
module.exports = {
  name: 'shuffle',
  description: 'Shuffles the songs in the current queue',
  execute(message, args) {
    const { getQueue } = require('../utils/musicUtils');
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('There is no song currently playing!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to use this command!');
    }
    
    if (queue.songs.length <= 1) {
      return message.reply('There are not enough songs in the queue to shuffle!');
    }
    
    // Shuffle the queue using Fisher-Yates algorithm
    for (let i = queue.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
    }
    
    // Create rich embed for shuffle
    const embed = {
      color: 0x9b59b6,
      title: '🔀 Queue Shuffled',
      description: `Successfully shuffled ${queue.songs.length} songs in the queue!`,
      footer: { text: `Requested by ${message.author.tag}` }
    };
    
    if (queue.currentSong && queue.currentSong.thumbnail) {
      embed.thumbnail = { url: queue.currentSong.thumbnail };
    }
    
    message.channel.send({ embeds: [embed] });
  }
};
