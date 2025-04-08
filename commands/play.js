const { getQueue, joinChannel, playSong } = require('../utils/musicUtils');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

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
      if (ytdl.validateURL(query)) {
        const songInfo = await ytdl.getInfo(query);
        const song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: parseInt(songInfo.videoDetails.lengthSeconds),
          thumbnail: songInfo.videoDetails.thumbnails[0].url,
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
        // Search for the song on YouTube
        const videos = await yts(query);
        if (!videos.videos.length) {
          return message.reply('No search results found!');
        }
        
        const video = videos.videos[0];
        const song = {
          title: video.title,
          url: video.url,
          duration: video.seconds,
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
