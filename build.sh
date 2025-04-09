#!/bin/bash
# Install Python and pip if not already installed
apt-get update && apt-get install -y python3 python3-pip ffmpeg

# Install yt-dlp using pip
pip install yt-dlp

# Create temp directory
mkdir -p temp

# Make yt-dlp executable and available in PATH
ln -sf $(which yt-dlp) /usr/local/bin/yt-dlp
chmod +x /usr/local/bin/yt-dlp

# Test yt-dlp installation
echo "Testing yt-dlp installation:"
which yt-dlp
yt-dlp --version

echo "Build script completed successfully"
