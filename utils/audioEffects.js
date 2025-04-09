// Enhanced ytdl-core audioEffects.js with environment variable support
const { createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

// Try to load cookies from environment variable first, then fallback to file
let cookies = process.env.YOUTUBE_COOKIES || '';
if (cookies) {
  console.log('Using YouTube cookies from environment variables');
} else {
  // Fallback to file-based cookies if environment variable is not set
  try {
    const cookiesPath = path.join(__dirname, '..', 'youtube-cookies.txt');
    if (fs.existsSync(cookiesPath)) {
      cookies = fs.readFileSync(cookiesPath, 'utf8');
      console.log('YouTube cookies loaded from file');
    } else {
      console.log('No YouTube cookies file found');
    }
  } catch (error) {
    console.error('Error loading YouTube cookies:', error);
  }
}

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
    console.log(`Attempting to stream from URL: ${url}`);
    
    // Configure ytdl options with cookies for authentication
    const ytdlOptions = {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25, // 32MB buffer
      requestOptions: {
        headers: {
          Cookie: cookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    };
    
    // Log if we're using cookies
    if (cookies) {
      console.log('Using YouTube cookies for authentication');
    } else {
      console.log('No YouTube cookies available, attempting without authentication');
    }
    
    // Create stream with ytdl-core
    const audioStream = ytdl(url, ytdlOptions);
    
    // Set up error handling for the stream
    audioStream.on('error', (error) => {
      console.error('YouTube stream error:', error);
    });
    
    // Apply effects if enabled
    let processedStream = audioStream;
    
    if (queue.nightcoreEnabled) {
      processedStream = applyNightcoreEffect(processedStream, true);
    }
    
    // Apply equalizer if any settings are non-zero
    const hasEqSettings = queue.equalizer.bass !== 0 || 
                         queue.equalizer.mid !== 0 || 
                         queue.equalizer.treble !== 0;
    
    if (hasEqSettings) {
      processedStream = applyEqualizerSettings(processedStream, queue.equalizer);
    }
    
    // Create and return the audio resource
    const resource = createAudioResource(processedStream, {
      inputType: 'opus',
      inlineVolume: true
    });
    
    console.log("Audio resource created successfully");
    
    if (resource.volume) {
      resource.volume.setVolume(queue.volume);
      console.log(`Volume set to ${queue.volume}`);
    }
    
    return resource;
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
