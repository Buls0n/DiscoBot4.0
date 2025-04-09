// Utility functions for music commands
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

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
  
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
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
    
    // Create audio resource with effects
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

// Search for a song on YouTube
async function searchSong(query) {
  try {
    const result = await yts(query);
    return result.videos.slice(0, 10);
  } catch (error) {
    console.error(error);
    return [];
  }
}

module.exports = {
  MusicQueue,
  getQueue,
  joinChannel,
  playSong,
  searchSong
};
