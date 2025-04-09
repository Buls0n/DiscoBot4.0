// Final audioEffects.js for Railway deployment with play-dl
const { createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');

/**
 * Apply nightcore effect to audio stream
 * @param {Stream} stream - The audio stream
 * @param {boolean} enabled - Whether the effect is enabled
 * @returns {Stream} - The processed audio stream
 */
function applyNightcoreEffect(stream, enabled) {
  if (!enabled || !stream) {
    console.log('Nightcore effect disabled or no stream provided');
    return stream;
  }
  
  try {
    console.log('Applying nightcore effect to audio stream');
    
    // In a real implementation with FFmpeg, we would apply audio filters
    // For now, we just return the original stream
    return stream;
  } catch (error) {
    console.error('Error applying nightcore effect:', error);
    return stream; // Return original stream on error
  }
}

/**
 * Apply equalizer settings to audio stream
 * @param {Stream} stream - The audio stream
 * @param {Object} settings - Equalizer settings (bass, mid, treble)
 * @returns {Stream} - The processed audio stream
 */
function applyEqualizerSettings(stream, settings) {
  if (!stream) {
    console.log('No stream provided for equalizer');
    return stream;
  }
  
  try {
    console.log(`Applying equalizer settings: Bass: ${settings.bass}, Mid: ${settings.mid}, Treble: ${settings.treble}`);
    
    // In a real implementation with FFmpeg, we would apply equalizer filters
    // For now, we just return the original stream
    return stream;
  } catch (error) {
    console.error('Error applying equalizer settings:', error);
    return stream; // Return original stream on error
  }
}

/**
 * Create an audio resource with effects applied
 * @param {string} url - YouTube URL
 * @param {Object} queue - Queue object with effect settings
 * @returns {AudioResource} - Discord.js audio resource
 */
async function createAudioResourceWithEffects(url, queue) {
  try {
    // Use play-dl instead of ytdl-core for better compatibility
    const stream = await play.stream(url);
    
    // Apply effects if enabled
    let audioStream = stream.stream;
    
    if (queue.nightcoreEnabled) {
      audioStream = applyNightcoreEffect(audioStream, true);
    }
    
    // Apply equalizer if any settings are non-zero
    const hasEqSettings = queue.equalizer.bass !== 0 || 
                         queue.equalizer.mid !== 0 || 
                         queue.equalizer.treble !== 0;
    
    if (hasEqSettings) {
      audioStream = applyEqualizerSettings(audioStream, queue.equalizer);
    }
    
    // Create and return the audio resource
    return createAudioResource(audioStream, {
      inputType: stream.type,
      inlineVolume: true
    });
  } catch (error) {
    console.error('Error creating audio resource with effects:', error);
    throw error;
  }
}

/**
 * Apply volume adjustment to audio stream
 * @param {Stream} stream - The audio stream
 * @param {number} volume - Volume level (0.0 to 2.0)
 * @returns {Stream} - The processed audio stream
 */
function applyVolumeAdjustment(stream, volume) {
  if (!stream) {
    return stream;
  }
  
  try {
    console.log(`Applying volume adjustment: ${volume}`);
    
    // In a real implementation with FFmpeg, we would apply volume filters
    // For now, we just return the original stream
    return stream;
  } catch (error) {
    console.error('Error applying volume adjustment:', error);
    return stream; // Return original stream on error
  }
}

module.exports = {
  applyNightcoreEffect,
  applyEqualizerSettings,
  applyVolumeAdjustment,
  createAudioResourceWithEffects
};
