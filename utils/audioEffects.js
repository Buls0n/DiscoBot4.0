// Modified audioEffects.js to work with yt-dlp instead of play-dl
const { createAudioResource } = require('@discordjs/voice');
const { createReadStream } = require('fs');
const { join } = require('path');
const ytdlpUtils = require('./ytdlpUtils');

/**
 * Create audio resource with effects
 * @param {string} url - YouTube URL
 * @param {Object} queue - Queue object with effect settings
 * @returns {Promise<AudioResource>} - Audio resource with effects
 */
async function createAudioResourceWithEffects(url, queue) {
  try {
    // Get audio stream from yt-dlp
    const audioData = await ytdlpUtils.getAudioStream(url);
    
    // Apply audio effects using FFmpeg
    const ffmpegArgs = [];
    
    // Apply volume
    if (queue.volume !== 1) {
      ffmpegArgs.push('-af', `volume=${queue.volume}`);
    }
    
    // Apply nightcore effect
    if (queue.nightcoreEnabled) {
      ffmpegArgs.push('-af', 'asetrate=48000*1.25,aresample=48000');
    }
    
    // Apply equalizer
    if (queue.equalizer.bass !== 0 || queue.equalizer.mid !== 0 || queue.equalizer.treble !== 0) {
      const bassGain = queue.equalizer.bass;
      const midGain = queue.equalizer.mid;
      const trebleGain = queue.equalizer.treble;
      
      ffmpegArgs.push('-af', `equalizer=f=100:width_type=h:width=200:g=${bassGain},equalizer=f=1000:width_type=h:width=200:g=${midGain},equalizer=f=10000:width_type=h:width=200:g=${trebleGain}`);
    }
    
    // Create audio resource
    const resource = createAudioResource(audioData.stream, {
      inputType: 'opus',
      inlineVolume: true
    });
    
    return resource;
  } catch (error) {
    console.error('Error creating audio resource with effects:', error);
    throw error;
  }
}

module.exports = {
  createAudioResourceWithEffects
};
