// Optimized ytdlpUtils.js with direct streaming
const { spawn } = require('child_process');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const YtDlpWrap = require('yt-dlp-wrap').default;
const cookieManager = require('./cookieUtils');

// Initialize yt-dlp
const ytDlpWrap = new YtDlpWrap();

class YtdlpUtils {
  /**
   * Get video information using yt-dlp
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} - Video information
   */
  async getVideoInfo(url) {
    try {
      console.log(`Getting video info for: ${url}`);
      
      const args = [
        url,
        '--print', 'title,duration,thumbnail',
        '--no-playlist',
        '--skip-download'
      ];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      const result = await ytDlpWrap.execPromise(args);
      const lines = result.split('\n').filter(line => line.trim());
      
      if (lines.length < 3) {
        throw new Error('Incomplete video information');
      }
      
      const [title, durationStr, thumbnail] = lines;
      const duration = parseInt(durationStr, 10);
      
      return {
        title,
        url,
        duration: isNaN(duration) ? 0 : duration,
        thumbnail
      };
    } catch (error) {
      console.error('Error getting video info:', error);
      throw error;
    }
  }
  
  /**
   * Search for videos on YouTube using yt-dlp
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} - Array of video information
   */
  async searchVideos(query, limit = 5) {
    try {
      console.log(`Searching for: ${query}`);
      
      const args = [
        `ytsearch${limit}:${query}`,
        '--print', 'title,url,duration,thumbnail,channel',
        '--no-playlist',
        '--skip-download'
      ];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      const result = await ytDlpWrap.execPromise(args);
      const lines = result.split('\n').filter(line => line.trim());
      
      const videos = [];
      for (let i = 0; i < lines.length; i += 5) {
        if (i + 4 < lines.length) {
          const title = lines[i];
          const url = lines[i + 1];
          const durationStr = lines[i + 2];
          const thumbnail = lines[i + 3];
          const channelName = lines[i + 4];
          
          const duration = parseInt(durationStr, 10);
          
          videos.push({
            title,
            url,
            duration: isNaN(duration) ? 0 : duration,
            thumbnail,
            author: { name: channelName }
          });
        }
      }
      
      return videos;
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }
  
  /**
   * Get audio stream directly from YouTube using yt-dlp
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} - Audio stream and metadata
   */
  async getAudioStream(url) {
    try {
      console.log(`Creating direct audio stream for: ${url}`);
      
      const args = [
        'yt-dlp',
        '-f', 'bestaudio',
        '-o', '-',  // Output to stdout
        '--no-playlist'
      ];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      console.log(`Streaming audio with args: ${args.join(' ')}`);
      
      // Spawn yt-dlp process to stream directly
      const ytdlpProcess = spawn(args[0], args.slice(1));
      
      // Handle potential errors
      ytdlpProcess.stderr.on('data', (data) => {
        console.log(`yt-dlp stderr: ${data}`);
      });
      
      ytdlpProcess.on('error', (error) => {
        console.error(`yt-dlp process error: ${error}`);
      });
      
      // Return the stdout stream directly
      return {
        stream: ytdlpProcess.stdout,
        url,
        type: 'ytdlp-stream'
      };
    } catch (error) {
      console.error('Error getting direct audio stream:', error);
      throw error;
    }
  }
}

module.exports = new YtdlpUtils();
