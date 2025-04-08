const { getQueue } = require('../utils/musicUtils');

module.exports = {
  name: 'queue',
  description: 'Displays the current song queue',
  execute(message, args) {
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection || (!queue.currentSong && queue.songs.length === 0)) {
      return message.reply('There are no songs in the queue!');
    }
    
    // Create rich embed for queue
    const embed = {
      color: 0x2ecc71,
      title: '📜 Music Queue',
      description: '',
      fields: [],
      footer: { text: `Requested by ${message.author.tag}` }
    };
    
    // Add current song
    if (queue.currentSong) {
      const minutes = Math.floor(queue.currentSong.duration / 60);
      const seconds = queue.currentSong.duration % 60;
      const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      embed.thumbnail = { url: queue.currentSong.thumbnail };
      embed.fields.push({
        name: '🎵 Now Playing',
        value: `**${queue.currentSong.title}**\nDuration: ${durationFormatted} | Requested by: ${queue.currentSong.requestedBy}`
      });
    }
    
    // Add upcoming songs
    if (queue.songs.length === 0) {
      embed.description = '*No upcoming songs in queue*';
    } else {
      embed.description = `**Upcoming Songs: ${queue.songs.length}**`;
      
      // Group songs in batches of 5 to avoid hitting embed field limits
      const songsPerField = 5;
      const fieldCount = Math.ceil(queue.songs.length / songsPerField);
      
      for (let i = 0; i < fieldCount; i++) {
        const startIdx = i * songsPerField;
        const endIdx = Math.min(startIdx + songsPerField, queue.songs.length);
        
        let fieldValue = '';
        for (let j = startIdx; j < endIdx; j++) {
          const song = queue.songs[j];
          const minutes = Math.floor(song.duration / 60);
          const seconds = song.duration % 60;
          const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          
          fieldValue += `**${j + 1}.** ${song.title}\n`;
          fieldValue += `Duration: ${durationFormatted} | Requested by: ${song.requestedBy}\n\n`;
        }
        
        embed.fields.push({
          name: i === 0 ? 'Up Next' : `More Songs`,
          value: fieldValue
        });
      }
    }
    
    message.channel.send({ embeds: [embed] });
  }
};
