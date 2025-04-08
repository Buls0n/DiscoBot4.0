const { searchSong } = require('../utils/musicUtils');

module.exports = {
  name: 'search',
  description: 'Searches YouTube for the given title and returns a list of matching songs',
  async execute(message, args) {
    if (!args.length) {
      return message.reply('You need to provide a search query!');
    }

    const query = args.join(' ');
    
    try {
      message.channel.send(`🔍 Searching YouTube for: **${query}**`);
      
      const result = await searchSong(query);
      
      if (!result.length) {
        return message.reply('No search results found!');
      }
      
      // Create rich embed for search results
      const embed = {
        color: 0x9b59b6,
        title: '🎵 YouTube Search Results',
        description: 'Select a song by typing its number:',
        fields: [],
        footer: { text: 'Type a number from 1-10 to select a song, or "cancel" to cancel' }
      };
      
      // Add each result as a field
      for (let i = 0; i < result.length; i++) {
        const video = result[i];
        const minutes = Math.floor(video.duration.seconds / 60);
        const seconds = video.duration.seconds % 60;
        const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        embed.fields.push({
          name: `${i + 1}. ${video.title}`,
          value: `Duration: ${durationFormatted} | Channel: ${video.author.name}`
        });
      }
      
      const searchMessage = await message.channel.send({ embeds: [embed] });
      
      const filter = m => m.author.id === message.author.id && (
        (!isNaN(m.content) && m.content >= 1 && m.content <= result.length) || 
        m.content.toLowerCase() === 'cancel'
      );
      
      try {
        const collected = await message.channel.awaitMessages({ 
          filter, 
          max: 1, 
          time: 30000, 
          errors: ['time'] 
        });
        
        const choice = collected.first().content;
        
        if (choice.toLowerCase() === 'cancel') {
          return message.channel.send('🚫 Search cancelled.');
        }
        
        const index = parseInt(choice) - 1;
        
        // Execute the play command with the selected video URL
        const playCommand = message.client.commands.get('play');
        playCommand.execute(message, [result[index].url]);
        
      } catch (error) {
        console.error(error);
        message.channel.send('⏱️ No valid selection was made within 30 seconds, cancelling search.');
      }
      
    } catch (error) {
      console.error('Error in search command:', error);
      message.reply('There was an error searching for songs! Please try again.');
    }
  }
};
