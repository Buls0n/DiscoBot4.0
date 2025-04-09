# Discord Music Bot - README

A feature-rich Discord music bot with YouTube playback, queue management, audio effects, and more.

## Features

- **YouTube Playback**: Play songs from YouTube by URL or search query
- **Queue Management**: Add songs to queue, view queue, skip tracks
- **Audio Effects**: Nightcore mode, equalizer settings, bass boost
- **Interactive Search**: Search YouTube and select from results
- **Rich Embeds**: Visual feedback with thumbnails and progress bars
- **Additional Features**: Volume control, lyrics search, loop modes, queue shuffle

## Commands

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

## Installation

1. Clone this repository
2. Install dependencies with `npm install`
3. Configure your bot token in `config.json`
4. Start the bot with `npm start`

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Requirements

- Node.js v16.9.0 or higher
- FFmpeg (included via ffmpeg-static package)
- Discord.js v14
- A Discord Bot Token

## Project Structure

```
discord_music_bot/
├── commands/           # Command files
│   ├── play.js         # Play command
│   ├── skip.js         # Skip command
│   └── ...             # Other commands
├── utils/              # Utility functions
│   ├── musicUtils.js   # Music-related utilities
│   └── audioEffects.js # Audio processing utilities
├── config.json         # Bot configuration
├── index.js            # Main bot file
├── package.json        # Project dependencies
└── DEPLOYMENT.md       # Deployment instructions
```

## License

ISC

## Acknowledgements

- [discord.js](https://discord.js.org/) - Discord API wrapper
- [ytdl-core](https://github.com/fent/node-ytdl-core) - YouTube downloader
- [yt-search](https://github.com/talmobi/yt-search) - YouTube search API
- [FFmpeg](https://ffmpeg.org/) - Audio processing
