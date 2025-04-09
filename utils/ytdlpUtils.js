// Updated ytdlpUtils.js with better yt-dlp path handling
const YTDlpWrap = require('yt-dlp-wrap').default;
const { createWriteStream } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const cookieManager = require('./cookieUtils');

const execAsync = promisify(exec);

// Try to find yt-dlp in different possible locations
const ytDlpPaths = [
  'yt-dlp',
  '/usr/local/bin/yt-dlp',
  '/usr/bin/yt-dlp',
  '/bin/yt-dlp'
];

let ytDlpWrap;
for (const path of ytDlpPaths) {
  try {
    ytDlpWrap = new YTDlpWrap(path);
    console.log(`Found yt-dlp at: ${path}`);
    break;
  } catch (error) {
    console.log(`yt-dlp not found at: ${path}`);
  }
}

if (!ytDlpWrap) {
  console.error('Could not find yt-dlp in any expected location');
  ytDlpWrap = new YTDlpWrap('yt-dlp'); // Fallback to default
}

/**
 * Utility class for yt-dlp operations
 */
class YtdlpUtils {
  constructor() {
    this.tempDir = join(__dirname, '..', 'temp');
  }

  /**
   * Get video info from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} - Video info
   */
  async getVideoInfo(url) {
    try {
      const args = [url, '--dump-json'];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      const videoInfo = await ytDlpWrap.getVideoInfo(url);
      return {
        title: videoInfo.title,
        url: url,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        uploader: videoInfo.uploader
      };
    } catch (error) {
      console.error('Error getting video info:', error);
      throw error;
    }
  }

  /**
   * Search for videos on YouTube
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} - Array of video info objects
   */
  async searchVideos(query, limit = 10) {
    try {
      // Use ytsearch prefix for YouTube search
      const searchUrl = `ytsearch${limit}:${query}`;
      
      const args = [
        searchUrl,
        '--dump-json',
        '--flat-playlist'
      ];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      // Execute yt-dlp command
      const command = `${ytDlpWrap.getBinaryPath()} ${args.join(' ')}`;
      console.log(`Executing command: ${command}`);
      
      const { stdout } = await execAsync(command);
      
      // Parse JSON results (one per line)
      const results = stdout.trim().split('\n').map(line => JSON.parse(line));
      
      return results.map(video => ({
        title: video.title,
        url: video.webpage_url || video.url,
        duration: video.duration,
        thumbnail: video.thumbnail,
        author: { name: video.uploader || video.channel }
      }));
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  }

  /**
   * Download audio from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {Promise<string>} - Path to downloaded audio file
   */
  async downloadAudio(url) {
    try {
      const videoInfo = await this.getVideoInfo(url);
      const outputFile = join(this.tempDir, `${Date.now()}.mp3`);
      
      const args = [
        url,
        '-x',
        '--audio-format', 'mp3',
        '-o', outputFile
      ];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      // Execute download
      await ytDlpWrap.execPromise(args);
      
      return outputFile;
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw error;
    }
  }

  /**
   * Stream audio from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} - Stream info object
   */
  async getAudioStream(url) {
    try {
      const args = [
        url,
        '-f', 'bestaudio',
        '--no-playlist',
        '-o', '-'  // Output to stdout
      ];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      // Get stream
      const stream = ytDlpWrap.execStream(args);
      
      return {
        stream,
        url,
        type: 'ytdlp'
      };
    } catch (error) {
      console.error('Error getting audio stream:', error);
      throw error;
    }
  }
}

module.exports = new YtdlpUtils();
