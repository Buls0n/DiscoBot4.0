// Modified play.js for Railway deployment with yt-dlp
const { getQueue, joinChannel, playSong } = require('../utils/musicUtils');
const ytdlpUtils = require('../utils/ytdlpUtils');
const { URL } = require('url');

module.exports = {
  name: 'play',
  description: 'Plays a song from YouTube by either a direct link or a search query',
  async execute(message, args) {
    if (!args.length) {
      return message.reply('You need to provide a YouTube URL or search query!');
    }

    const query = args.join(' ');
    
    // Join the voice channel
    const queue = await joinChannel(message);
    if (!queue) return;
    
    try {
      message.channel.send(`🔍 Searching for: **${query}**`);
      
      // Check if the argument is a valid YouTube URL
      const isUrl = isValidYouTubeUrl(query);
      
      if (isUrl) {
        // Get video info using yt-dlp
        const videoInfo = await ytdlpUtils.getVideoInfo(query);
        
        const song = {
          title: videoInfo.title,
          url: videoInfo.url,
          duration: videoInfo.duration,
          thumbnail: videoInfo.thumbnail,
          requestedBy: message.author.tag
        };
        
        queue.songs.push(song);
        
        const minutes = Math.floor(song.duration / 60);
        const seconds = song.duration % 60;
        const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        message.channel.send({
          embeds: [{
            color: 0x3498db,
            title: '🎵 Added to Queue',
            description: `**${song.title}**`,
            thumbnail: { url: song.thumbnail },
            fields: [
              { name: 'Duration', value: durationFormatted, inline: true },
              { name: 'Requested By', value: song.requestedBy, inline: true }
            ],
            footer: { text: 'YouTube' }
          }]
        });
        
        if (!queue.currentSong) {
          playSong(queue);
        }
      } else {
        // Search for the song on YouTube using yt-dlp
        const searchResults = await ytdlpUtils.searchVideos(query, 1);
        if (!searchResults.length) {
          return message.reply('No search results found!');
        }
        
        const video = searchResults[0];
        const song = {
          title: video.title,
          url: video.url,
          duration: video.duration,
          thumbnail: video.thumbnail,
          requestedBy: message.author.tag
        };
        
        queue.songs.push(song);
        
        const minutes = Math.floor(song.duration / 60);
        const seconds = song.duration % 60;
        const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        message.channel.send({
          embeds: [{
            color: 0x3498db,
            title: '🎵 Added to Queue',
            description: `**${song.title}**`,
            thumbnail: { url: song.thumbnail },
            fields: [
              { name: 'Duration', value: durationFormatted, inline: true },
              { name: 'Requested By', value: song.requestedBy, inline: true }
            ],
            footer: { text: 'YouTube' }
          }]
        });
        
        if (!queue.currentSong) {
          playSong(queue);
        }
      }
    } catch (error) {
      console.error('Error in play command:', error);
      message.reply('There was an error processing your request! Please try again.');
    }
  }
};

// Helper function to validate YouTube URL
function isValidYouTubeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'www.youtu.be'
    ) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}
