FROM node:20

# Install Python, pip, and ffmpeg
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    pip3 install yt-dlp && \
    mkdir -p /app/temp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Verify yt-dlp installation
RUN which yt-dlp && yt-dlp --version

# Command to run the application
CMD ["node", "index.js"]
