// Updated cookieUtils.js - Secure cookie handling via environment variables
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const existsAsync = promisify(fs.exists);

/**
 * Cookie manager for yt-dlp authentication
 * Handles Netscape format cookies from environment variables for security
 */
class CookieManager {
  constructor() {
    this.cookiePath = path.join(__dirname, '..', 'cookies.txt');
  }

  /**
   * Initialize cookies from environment variable
   * @returns {Promise<boolean>} - True if cookies were successfully initialized
   */
  async initFromEnvironment() {
    try {
      const cookieData = process.env.YOUTUBE_COOKIES;
      
      if (!cookieData) {
        console.log('No YouTube cookies found in environment variables');
        return false;
      }
      
      await writeFileAsync(this.cookiePath, cookieData, 'utf8');
      console.log('Cookies initialized from environment variable');
      
      // Set file permissions to be readable only by the process owner
      fs.chmodSync(this.cookiePath, 0o600);
      
      return true;
    } catch (error) {
      console.error('Error initializing cookies from environment:', error);
      return false;
    }
  }

  /**
   * Check if cookie file exists
   * @returns {Promise<boolean>} - True if cookie file exists
   */
  async hasCookies() {
    return await existsAsync(this.cookiePath);
  }

  /**
   * Get path to cookie file
   * @returns {string} - Path to cookie file
   */
  getCookiePath() {
    return this.cookiePath;
  }
}

module.exports = new CookieManager();
