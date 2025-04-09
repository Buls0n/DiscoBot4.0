// Create temp directory for yt-dlp downloads
const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, 'temp');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Created temp directory for yt-dlp downloads');
}
