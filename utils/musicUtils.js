// Verify that the musicUtils.js file is updated to work with our new implementations
const { createAudioPlayer, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { PermissionsBitField } = require('discord.js');
const ytdlpUtils = require('./ytdlpUtils');
const { restartCurrentSongWithEffects } = require('./audioEffects');

// Queue structure for each guild
class MusicQueue {
  constructor() {
    this.songs = [];
    this.currentSong = null;
    this.volume = 1;
    this.player = createAudioPlayer();
    this.connection = null;
    this.textChannel = null;
    this.nightcoreEnabled = false;
    this.equalizer = {
      bass: 0,
      mid: 0,
      treble: 0
    };
  }
}

// Get or create a queue for a guild
function getQueue(client, guildId) {
  if (!client.queues.has(guildId)) {
    client.queues.set(guildId, new MusicQueue());
  }
  return client.queues.get(guildId);
}

// Join a voice channel
async function joinChannel(message) {
  const voiceChannel = message.member.voice.channel;
  
  if (!voiceChannel) {
    message.reply('You need to be in a voice channel to use this command!');
    return null;
  }
  
  // Updated permissions check for Discord.js v14
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
    message.reply('I need permissions to join and speak in your voice channel!');
    return null;
  }
  
  const queue = getQueue(message.client, message.guild.id);
  queue.textChannel = message.channel;
  
  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });
    
    queue.connection = connection;
    
    connection.on(VoiceConnectionStatus.Disconnected, () => {
      queue.songs = [];
      queue.currentSong = null;
    });
    
    return queue;
  } catch (error) {
    console.error(error);
    message.reply('There was an error connecting to the voice channel!');
    return null;
  }
}

// Play a song
async function playSong(queue) {
  if (queue.songs.length === 0) {
    if (queue.connection) {
      queue.connection.destroy();
      queue.connection = null;
    }
    return;
  }
  
  queue.currentSong = queue.songs.shift();
  
  try {
    // Import audio effects utility
    const { createAudioResourceWithEffects } = require('./audioEffects');
    
    // Create audio resource with effects using optimized streaming
    const resource = await createAudioResourceWithEffects(queue.currentSong.url, queue);
    queue.player.play(resource);
    
    queue.connection.subscribe(queue.player);
    
    queue.player.on(AudioPlayerStatus.Idle, () => {
      playSong(queue);
    });
    
    queue.textChannel.send(`🎵 Now playing: **${queue.currentSong.title}**`);
  } catch (error) {
    console.error(error);
    queue.textChannel.send('There was an error playing the song!');
    playSong(queue);
  }
}

// Search for a song on YouTube using yt-dlp
async function searchSong(query) {
  try {
    // Use ytdlpUtils instead of play-dl
    const searchResults = await ytdlpUtils.searchVideos(query, 10);
    return searchResults.map(video => ({
      title: video.title,
      url: video.url,
      duration: { seconds: video.duration },
      timestamp: formatDuration(video.duration),
      thumbnail: video.thumbnail,
      author: { name: video.author.name }
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Helper function to format duration
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Update current song with new effects
async function updateCurrentSongEffects(queue) {
  if (queue.currentSong) {
    await restartCurrentSongWithEffects(queue);
  }
}

module.exports = {
  MusicQueue,
  getQueue,
  joinChannel,
  playSong,
  searchSong,
  updateCurrentSongEffects
};
