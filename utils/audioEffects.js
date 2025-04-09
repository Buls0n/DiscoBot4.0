// Optimized audioEffects.js with direct streaming and immediate effect application
const { createAudioResource, StreamType } = require('@discordjs/voice');
const { Transform } = require('stream');
const prism = require('prism-media');

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
    const ytdlpUtils = require('./ytdlpUtils');
    const audioData = await ytdlpUtils.getAudioStream(url);
    console.log(`Got audio stream of type: ${audioData.type}`);
    
    // Apply audio effects to the stream
    let processedStream = audioData.stream;
    
    // Apply effects based on queue settings
    if (queue.nightcoreEnabled || queue.equalizer.bass !== 0 || queue.equalizer.mid !== 0 || queue.equalizer.treble !== 0) {
      // Create FFmpeg arguments for audio effects
      const ffmpegArgs = [
        '-i', 'pipe:0',  // Input from stdin
        '-f', 's16le',   // Output format
        '-ar', '48000',  // Sample rate
        '-ac', '2'       // Stereo
      ];
      
      // Add nightcore effect (speed/pitch adjustment)
      if (queue.nightcoreEnabled) {
        ffmpegArgs.push('-af', 'asetrate=48000*1.25,aresample=48000');
      }
      
      // Add equalizer settings if any are non-zero
      if (queue.equalizer.bass !== 0 || queue.equalizer.mid !== 0 || queue.equalizer.treble !== 0) {
        // Convert our simple -10 to 10 scale to appropriate FFmpeg equalizer values
        const bassGain = queue.equalizer.bass * 2; // -20dB to +20dB
        const midGain = queue.equalizer.mid * 2;   // -20dB to +20dB
        const trebleGain = queue.equalizer.treble * 2; // -20dB to +20dB
        
        ffmpegArgs.push('-af', `equalizer=f=100:width_type=o:width=2:g=${bassGain},equalizer=f=1000:width_type=o:width=2:g=${midGain},equalizer=f=8000:width_type=o:width=2:g=${trebleGain}`);
      }
      
      // Output to stdout
      ffmpegArgs.push('pipe:1');
      
      // Create FFmpeg process
      const ffmpeg = new prism.FFmpeg({
        args: ffmpegArgs
      });
      
      // Pipe the audio stream through FFmpeg
      processedStream.pipe(ffmpeg);
      processedStream = ffmpeg;
    }
    
    // Create audio resource with processed stream
    const resource = createAudioResource(processedStream, {
      inputType: StreamType.Raw,
      inlineVolume: true
    });
    
    // Set volume if needed
    if (queue.volume !== 1 && resource.volume) {
      resource.volume.setVolume(queue.volume);
    }
    
    console.log('Audio resource created successfully with effects applied');
    return resource;
  } catch (error) {
    console.error('Error creating audio resource with effects:', error);
    throw error;
  }
}

/**
 * Apply equalizer settings to current playback
 * @param {AudioPlayer} player - The audio player
 * @param {Object} settings - Equalizer settings
 */
function applyEqualizerSettings(player, settings) {
  // This function is now handled directly in createAudioResourceWithEffects
  // We'll use it to restart the current song with new settings
  console.log('Applying equalizer settings:', settings);
}

/**
 * Restart current song with updated effects
 * @param {Object} queue - Queue object with updated effect settings
 */
async function restartCurrentSongWithEffects(queue) {
  if (!queue.currentSong) {
    console.log('No current song to restart');
    return;
  }
  
  try {
    console.log(`Restarting current song with updated effects: ${queue.currentSong.title}`);
    
    // Create new audio resource with updated effects
    const resource = await createAudioResourceWithEffects(queue.currentSong.url, queue);
    
    // Stop current playback and play with new effects
    queue.player.stop();
    queue.player.play(resource);
    
    console.log('Current song restarted with new effects');
  } catch (error) {
    console.error('Error restarting current song with effects:', error);
  }
}

module.exports = {
  createAudioResourceWithEffects,
  applyEqualizerSettings,
  restartCurrentSongWithEffects
};
