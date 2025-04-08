const { getQueue } = require('../utils/musicUtils');

module.exports = {
  name: 'skip',
  description: 'Skips the currently playing track',
  execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection || !queue.currentSong) {
      return message.reply('There is no song currently playing!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to skip songs!');
    }
    
    const currentSong = queue.currentSong;
    
    message.channel.send({
      embeds: [{
        color: 0xe74c3c,
        title: '⏭️ Skipped Song',
        description: `**${currentSong.title}**`,
        thumbnail: { url: currentSong.thumbnail },
        footer: { text: `Skipped by ${message.author.tag}` }
      }]
    });
    
    queue.player.stop();
  }
};
