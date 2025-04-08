// Enhanced audio effects utility for Discord music bot
const { createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const prism = require('prism-media');
const { pipeline } = require('stream');

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
    
    // Create FFmpeg args for nightcore effect (increased speed and pitch)
    // In a real implementation, we would use FFmpeg to adjust tempo and pitch
    const args = [
      '-i', '-',              // Input from stdin
      '-af', 'asetrate=44100*1.25,aresample=44100', // Increase speed by 25%
      '-f', 's16le',          // Output format
      '-ar', '48000',         // Output sample rate
      '-ac', '2',             // Stereo output
      'pipe:1'                // Output to stdout
    ];
    
    // Create FFmpeg process
    const ffmpeg = new prism.FFmpeg({ args });
    
    // Create pipeline: input stream -> ffmpeg -> output
    const output = pipeline(stream, ffmpeg, (err) => {
      if (err) {
        console.error('Error in nightcore audio pipeline:', err);
      }
    });
    
    return output;
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
    
    // Create FFmpeg args for 3-band equalizer
    // In a real implementation, we would use FFmpeg's equalizer filter
    const bassFilter = `equalizer=f=100:width_type=o:width=2:g=${settings.bass}`;
    const midFilter = `equalizer=f=1000:width_type=o:width=2:g=${settings.mid}`;
    const trebleFilter = `equalizer=f=8000:width_type=o:width=2:g=${settings.treble}`;
    
    const args = [
      '-i', '-',              // Input from stdin
      '-af', `${bassFilter},${midFilter},${trebleFilter}`, // Apply EQ filters
      '-f', 's16le',          // Output format
      '-ar', '48000',         // Output sample rate
      '-ac', '2',             // Stereo output
      'pipe:1'                // Output to stdout
    ];
    
    // Create FFmpeg process
    const ffmpeg = new prism.FFmpeg({ args });
    
    // Create pipeline: input stream -> ffmpeg -> output
    const output = pipeline(stream, ffmpeg, (err) => {
      if (err) {
        console.error('Error in equalizer audio pipeline:', err);
      }
    });
    
    return output;
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
    // Get YouTube stream
    let stream = ytdl(url, { 
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    });
    
    // Apply effects if enabled
    if (queue.nightcoreEnabled) {
      stream = applyNightcoreEffect(stream, true);
    }
    
    // Apply equalizer if any settings are non-zero
    const hasEqSettings = queue.equalizer.bass !== 0 || 
                         queue.equalizer.mid !== 0 || 
                         queue.equalizer.treble !== 0;
    
    if (hasEqSettings) {
      stream = applyEqualizerSettings(stream, queue.equalizer);
    }
    
    // Create and return the audio resource
    return createAudioResource(stream);
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
    
    // Create FFmpeg args for volume adjustment
    const args = [
      '-i', '-',              // Input from stdin
      '-af', `volume=${volume}`, // Volume filter
      '-f', 's16le',          // Output format
      '-ar', '48000',         // Output sample rate
      '-ac', '2',             // Stereo output
      'pipe:1'                // Output to stdout
    ];
    
    // Create FFmpeg process
    const ffmpeg = new prism.FFmpeg({ args });
    
    // Create pipeline: input stream -> ffmpeg -> output
    const output = pipeline(stream, ffmpeg, (err) => {
      if (err) {
        console.error('Error in volume adjustment pipeline:', err);
      }
    });
    
    return output;
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
