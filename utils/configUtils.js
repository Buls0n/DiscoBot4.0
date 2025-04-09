// Central configuration utility for Discord music bot
// This file provides a unified way to access configuration values
// from either environment variables or config.json

require('dotenv').config();

// Try to load config.json, but don't fail if it doesn't exist
let config = {};
try {
  config = require('../config.json');
} catch (error) {
  console.log('No config.json found, using environment variables');
}

/**
 * Configuration utility for Discord music bot
 * Prioritizes environment variables over config.json values
 */
module.exports = {
  /**
   * Get the command prefix
   * @returns {string} Command prefix
   */
  getPrefix: () => process.env.PREFIX || config.prefix || '!',
  
  /**
   * Get the Discord bot token
   * @returns {string} Bot token
   */
  getToken: () => process.env.TOKEN || config.token,
  
  /**
   * Get the bot activity status
   * @returns {string} Activity status
   */
  getActivity: () => process.env.ACTIVITY || config.activity || '!help | Music',
  
  /**
   * Get the client ID
   * @returns {string} Client ID
   */
  getClientId: () => process.env.CLIENT_ID || config.clientId,
  
  /**
   * Check if running in production environment
   * @returns {boolean} True if in production
   */
  isProduction: () => process.env.NODE_ENV === 'production',
  
  /**
   * Get the full configuration object
   * @returns {object} Configuration object
   */
  getConfig: () => {
    return {
      prefix: module.exports.getPrefix(),
      token: module.exports.getToken(),
      activity: module.exports.getActivity(),
      clientId: module.exports.getClientId(),
      isProduction: module.exports.isProduction()
    };
  }
};
