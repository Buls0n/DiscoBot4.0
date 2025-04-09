// Updated ytdlpUtils.js with improved audio streaming functionality
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const { createWriteStream } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const { exec, execSync } = require('child_process');
const cookieManager = require('./cookieUtils');

const execAsync = promisify(exec);
const unlinkAsync = promisify(fs.unlink);

// Try to find the exact path to yt-dlp
let ytdlpPath;
try {
  ytdlpPath = execSync('which yt-dlp').toString().trim();
  console.log(`Found yt-dlp at: ${ytdlpPath}`);
} catch (error) {
  console.error('Error finding yt-dlp path:', error);
  ytdlpPath = 'yt-dlp'; // Fallback to default
}

// Try to find yt-dlp in different possible locations
const ytDlpPaths = [
  ytdlpPath,
  '/opt/venv/bin/yt-dlp', // Virtual environment path
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
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      console.log(`Created temp directory: ${this.tempDir}`);
    }
  }

  /**
   * Get video info from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} - Video info
   */
  async getVideoInfo(url) {
    try {
      console.log(`Getting video info for: ${url}`);
      const args = [url, '--dump-json'];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      // Execute yt-dlp command using full path
      const command = `${ytdlpPath} ${args.join(' ')}`;
      console.log(`Executing command: ${command}`);
      
      const { stdout } = await execAsync(command);
      const videoInfo = JSON.parse(stdout);
      
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
      // Check if yt-dlp is installed and working
      try {
        const { stdout: versionOutput } = await execAsync('which yt-dlp');
        console.log(`yt-dlp found at: ${versionOutput.trim()}`);
        
        const { stdout: versionInfo } = await execAsync('yt-dlp --version');
        console.log(`yt-dlp version: ${versionInfo.trim()}`);
      } catch (error) {
        console.error('Error checking yt-dlp installation:', error);
        
        // Try with virtual environment path
        try {
          const { stdout: venvOutput } = await execAsync('/opt/venv/bin/yt-dlp --version');
          console.log(`yt-dlp in virtual environment: ${venvOutput.trim()}`);
          ytdlpPath = '/opt/venv/bin/yt-dlp';
        } catch (venvError) {
          console.error('Error checking virtual environment yt-dlp:', venvError);
        }
      }
      
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
      
      // Execute yt-dlp command using full path
      const command = `${ytdlpPath} ${args.join(' ')}`;
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
      console.log(`Getting audio stream for: ${url}`);
      
      // Create a unique temp file path
      const tempFile = join(this.tempDir, `${Date.now()}.mp3`);
      
      // Build yt-dlp command with proper audio extraction
      const args = [
        url,
        '-x',
        '--audio-format', 'mp3',
        '-o', tempFile,
        '--no-playlist'
      ];
      
      // Add cookies if available
      if (await cookieManager.hasCookies()) {
        args.push('--cookies', cookieManager.getCookiePath());
      }
      
      console.log(`Downloading audio with args: ${args.join(' ')}`);
      
      // Download the audio file first
      await ytDlpWrap.execPromise(args);
      console.log(`Audio downloaded to: ${tempFile}`);
      
      // Create a readable stream from the downloaded file
      const stream = fs.createReadStream(tempFile);
      
      // Set up cleanup to delete the temp file when the stream ends
      stream.on('end', () => {
        console.log(`Cleaning up temp file: ${tempFile}`);
        fs.unlink(tempFile, (err) => {
          if (err) console.error(`Error deleting temp file: ${err}`);
        });
      });
      
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
