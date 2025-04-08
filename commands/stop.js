const { getQueue } = require('../utils/musicUtils');

module.exports = {
  name: 'stop',
  description: 'Stops the music and disconnects the bot from the voice channel',
  execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection) {
      return message.reply('The bot is not connected to a voice channel!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to stop the music!');
    }
    
    // Get current song info for the embed before clearing
    const currentSong = queue.currentSong;
    
    // Clear the queue
    queue.songs = [];
    queue.currentSong = null;
    
    // Stop the player and disconnect
    queue.player.stop();
    queue.connection.destroy();
    queue.connection = null;
    
    // Create rich embed for stop command
    const embed = {
      color: 0xe74c3c,
      title: '⏹️ Music Playback Stopped',
      description: 'Disconnected from voice channel',
      footer: { text: `Requested by ${message.author.tag}` }
    };
    
    if (currentSong && currentSong.thumbnail) {
      embed.thumbnail = { url: currentSong.thumbnail };
      embed.fields = [
        { name: 'Last Playing', value: currentSong.title }
      ];
    }
    
    message.channel.send({ embeds: [embed] });
  }
};
