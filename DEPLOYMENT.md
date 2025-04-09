# Discord Music Bot Deployment Guide

This guide will walk you through the process of deploying your Discord music bot to a Discord server.

## Prerequisites

Before deploying your bot, make sure you have:

1. A Discord account
2. Permission to add bots to a Discord server (Manage Server permission)
3. Node.js installed on your hosting machine
4. Git (optional, for cloning the repository)

## Step 1: Create a Discord Application and Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on "New Application" in the top right corner
3. Enter a name for your application (e.g., "Music Bot") and click "Create"
4. In the left sidebar, click on "Bot"
5. Click "Add Bot" and confirm by clicking "Yes, do it!"
6. Under the "TOKEN" section, click "Reset Token" and then "Yes, do it!" to generate a new token
7. Copy the token (you'll need it later)
8. Under "Privileged Gateway Intents", enable:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
9. Click "Save Changes"
10. In the left sidebar, click on "OAuth2" and then "URL Generator"
11. Under "Scopes", select "bot"
12. Under "Bot Permissions", select:
    - Read Messages/View Channels
    - Send Messages
    - Embed Links
    - Attach Files
    - Read Message History
    - Add Reactions
    - Connect
    - Speak
    - Use Voice Activity
13. Copy the generated URL at the bottom of the page

## Step 2: Invite the Bot to Your Server

1. Paste the URL you copied in the previous step into your web browser
2. Select the server you want to add the bot to from the dropdown menu
3. Click "Authorize"
4. Complete the CAPTCHA if prompted
5. The bot should now appear in your server's member list (it will be offline until you start it)

## Step 3: Configure Your Bot

1. Open the `config.json` file in your bot's directory
2. Replace `YOUR_BOT_TOKEN_HERE` with the token you copied earlier
3. Replace `YOUR_CLIENT_ID_HERE` with your application's Client ID (found in the "General Information" tab of your application in the Discord Developer Portal)
4. Save the file

```json
{
  "token": "your_bot_token_here",
  "clientId": "your_client_id_here",
  "prefix": "!",
  "activity": "!help | Music"
}
```

## Step 4: Install Dependencies and Start the Bot

### Local Deployment

If you're running the bot on your local machine:

1. Open a terminal/command prompt
2. Navigate to your bot's directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the bot:
   ```
   npm start
   ```

### VPS/Cloud Deployment

If you're deploying to a VPS or cloud service:

1. Connect to your server via SSH
2. Clone your repository or upload your bot files
3. Navigate to your bot's directory
4. Install dependencies:
   ```
   npm install
   ```
5. Install PM2 (process manager) to keep your bot running:
   ```
   npm install -g pm2
   ```
6. Start your bot with PM2:
   ```
   pm2 start index.js --name "music-bot"
   ```
7. Set PM2 to start on boot:
   ```
   pm2 startup
   pm2 save
   ```

## Step 5: Verify Bot is Working

1. In your Discord server, join a voice channel
2. Type `!help` in a text channel where the bot has access
3. The bot should respond with a list of available commands
4. Test the bot's functionality by playing a song with `!play <song name or URL>`

## Troubleshooting

If your bot doesn't work as expected, check the following:

1. **Bot is offline**: Make sure your bot is running and the token in `config.json` is correct
2. **Bot doesn't respond to commands**: Check that the bot has the necessary permissions in the channel
3. **Bot can't join voice channel**: Ensure the bot has the "Connect" and "Speak" permissions
4. **Audio doesn't play**: Make sure you have all dependencies installed, including FFmpeg
5. **Error messages**: Check your console/terminal for error messages that might indicate the issue

## Additional Notes

- The bot uses FFmpeg for audio processing. If you're having issues with audio effects, make sure FFmpeg is properly installed.
- For the nightcore and equalizer effects to work properly, you may need to adjust the FFmpeg settings in the `audioEffects.js` file.
- The bot's prefix is set to `!` by default. You can change this in the `config.json` file.
- To add more commands or customize existing ones, modify the files in the `commands` directory.

## Commands Reference

Here's a quick reference of all available commands:

- `!play <url or title>` — Plays a song from YouTube by URL or search query
- `!skip` — Skips the currently playing track
- `!search <title>` — Searches YouTube for songs and lets you choose one
- `!queue` — Displays the current song queue
- `!nightcore` — Toggles the nightcore effect
- `!eq [bass] [mid] [treble]` — Adjusts equalizer settings (-10 to 10)
- `!stop` — Stops playback and disconnects from voice channel
- `!volume [1-200]` — Adjusts or displays the volume level
- `!bassboost [off|low|medium|high]` — Applies bass boost effect
- `!lyrics [song title]` — Searches for lyrics of current or specified song
- `!nowplaying` — Shows details about the currently playing song
- `!loop [none|song|queue]` — Controls loop mode
- `!shuffle` — Randomizes the song queue
- `!help` — Displays all available commands

Enjoy your new Discord music bot!
