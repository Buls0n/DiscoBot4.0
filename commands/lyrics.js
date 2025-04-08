// Command to display song lyrics
module.exports = {
  name: 'lyrics',
  description: 'Searches for lyrics of the current or specified song',
  async execute(message, args) {
    const { getQueue } = require('../utils/musicUtils');
    const queue = getQueue(message.client, message.guild.id);
    
    let songTitle;
    
    if (args.length > 0) {
      // Use provided song title
      songTitle = args.join(' ');
    } else if (queue.currentSong) {
      // Use current playing song
      songTitle = queue.currentSong.title;
      
      // Clean up title (remove things like "Official Video", etc.)
      songTitle = songTitle
        .replace(/([\(\[]).*?([\)\]])/g, '') // Remove content in brackets
        .replace(/official\s*(music)?\s*video/i, '')
        .replace(/lyrics?\s*video/i, '')
        .replace(/audio/i, '')
        .replace(/hd|hq/i, '')
        .replace(/\s{2,}/g, ' ') // Remove extra spaces
        .trim();
    } else {
      return message.reply('There is no song currently playing! Please provide a song title.');
    }
    
    try {
      message.channel.send(`🔍 Searching for lyrics of: **${songTitle}**`);
      
      // In a real implementation, we would use a lyrics API like Genius
      // For this example, we'll simulate a lyrics search
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create rich embed for lyrics
      const embed = {
        color: 0x9b59b6,
        title: `📝 Lyrics for: ${songTitle}`,
        description: 'This is a placeholder for actual lyrics.\n\nIn a real implementation, this would fetch lyrics from an API like Genius or Musixmatch.\n\nThe lyrics would appear here with proper formatting.',
        footer: { text: 'Note: This is a demonstration. Actual lyrics would be displayed in a real implementation.' }
      };
      
      if (queue.currentSong && queue.currentSong.thumbnail) {
        embed.thumbnail = { url: queue.currentSong.thumbnail };
      }
      
      message.channel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      message.reply('There was an error fetching the lyrics. Please try again later.');
    }
  }
};
