// Command to display information about the current song
module.exports = {
  name: 'nowplaying',
  description: 'Shows details about the currently playing song',
  execute(message, args) {
    const { getQueue } = require('../utils/musicUtils');
    const queue = getQueue(message.client, message.guild.id);
    
    if (!queue.connection || !queue.currentSong) {
      return message.reply('There is no song currently playing!');
    }
    
    // Calculate progress bar
    const songDuration = queue.currentSong.duration;
    // In a real implementation, we would track the current position
    // For this example, we'll simulate a random position
    const currentPosition = Math.floor(Math.random() * songDuration);
    const progressBarLength = 20;
    const progressFilled = Math.floor((currentPosition / songDuration) * progressBarLength);
    
    let progressBar = '▬'.repeat(progressFilled) + '🔘' + '▬'.repeat(progressBarLength - progressFilled - 1);
    
    // Format timestamps
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
    
    const currentTime = formatTime(currentPosition);
    const totalTime = formatTime(songDuration);
    
    // Create rich embed for now playing
    const embed = {
      color: 0x2ecc71,
      title: '🎵 Now Playing',
      description: `**${queue.currentSong.title}**`,
      thumbnail: { url: queue.currentSong.thumbnail },
      fields: [
        { name: 'Progress', value: `${progressBar}\n${currentTime} / ${totalTime}`, inline: false },
        { name: 'Requested By', value: queue.currentSong.requestedBy, inline: true },
        { name: 'Volume', value: `${queue.volume * 100}%`, inline: true }
      ],
      footer: { text: 'Use !queue to see upcoming songs' }
    };
    
    // Add effects status if enabled
    if (queue.nightcoreEnabled) {
      embed.fields.push({ name: 'Effects', value: 'Nightcore: Enabled', inline: true });
    }
    
    if (queue.equalizer.bass !== 0 || queue.equalizer.mid !== 0 || queue.equalizer.treble !== 0) {
      embed.fields.push({ 
        name: 'Equalizer', 
        value: `Bass: ${queue.equalizer.bass}, Mid: ${queue.equalizer.mid}, Treble: ${queue.equalizer.treble}`, 
        inline: true 
      });
    }
    
    message.channel.send({ embeds: [embed] });
  }
};
