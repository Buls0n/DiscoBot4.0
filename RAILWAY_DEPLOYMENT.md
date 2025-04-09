# Discord Bot with yt-dlp Secure Cookie Authentication - Railway Deployment Guide

## Environment Variables for Railway

When deploying to Railway, you'll need to set the following environment variables:

- `TOKEN`: Your Discord bot token
- `PREFIX`: Command prefix (default: !)
- `ACTIVITY`: Bot activity status (default: !help | Music)
- `YOUTUBE_COOKIES`: Content of your Netscape format cookies file (for secure YouTube authentication)

## Secure Cookie Authentication

For security reasons, cookies are handled through environment variables instead of Discord commands:

1. Install a browser extension like "Get cookies.txt" for Chrome
2. Export cookies in Netscape format from YouTube
3. Copy the entire content of the exported cookies.txt file
4. Add it as the `YOUTUBE_COOKIES` environment variable in Railway
5. The bot will automatically load these cookies at startup

This approach keeps your authentication cookies secure and prevents them from being exposed in Discord messages.

## Railway Deployment Steps

1. Create a Railway account at https://railway.app/
2. Install the Railway CLI: `npm i -g @railway/cli`
3. Login to Railway: `railway login`
4. Initialize your project: `railway init`
5. Link to your GitHub repository or deploy directly
6. Set environment variables in the Railway dashboard
7. Deploy your project: `railway up`

## Local Development Setup

Create a `.env` file in your project root with the following content:
```
TOKEN=your_discord_bot_token
PREFIX=!
ACTIVITY=!help | Music
YOUTUBE_COOKIES=# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	1735689600	VISITOR_INFO1_LIVE	YOUR_COOKIE_DATA
...rest of your cookie file...
```

This file is for local development only and should not be committed to your repository.

## Important Notes

- The temp directory must be writable for yt-dlp downloads
- Python and yt-dlp must be installed on the Railway instance
- The railway.toml file ensures proper setup during deployment
- Cookie data is stored securely and only accessible by the bot process
- Never share your cookie data through Discord messages or public channels
