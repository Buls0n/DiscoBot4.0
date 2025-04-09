// Updated audioEffects.js to work with yt-dlp and fix playback issues
const { createAudioResource, StreamType } = require('@discordjs/voice');
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
    console.log(`Creating audio resource for: ${url}`);
    
    // Get audio stream from yt-dlp
    const audioData = await ytdlpUtils.getAudioStream(url);
    console.log(`Got audio stream of type: ${audioData.type}`);
    
    // Create audio resource with proper stream type
    const resource = createAudioResource(audioData.stream, {
      inputType: StreamType.Arbitrary, // Use Arbitrary instead of opus
      inlineVolume: true
    });
    
    // Set volume if needed
    if (queue.volume !== 1 && resource.volume) {
      resource.volume.setVolume(queue.volume);
    }
    
    console.log('Audio resource created successfully');
    return resource;
  } catch (error) {
    console.error('Error creating audio resource with effects:', error);
    throw error;
  }
}

module.exports = {
  createAudioResourceWithEffects
};
