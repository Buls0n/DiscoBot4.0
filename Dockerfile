FROM node:20

# Install Python, pip, ffmpeg and create a virtual environment
RUN apt-get update && \
    apt-get install -y python3-full python3-pip ffmpeg python3-venv && \
    python3 -m venv /opt/venv

# Activate virtual environment and install yt-dlp
RUN . /opt/venv/bin/activate && \
    pip install yt-dlp && \
    mkdir -p /app/temp

# Add virtual environment to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Verify yt-dlp installation
RUN . /opt/venv/bin/activate && which yt-dlp && yt-dlp --version

# Command to run the application
CMD ["node", "index.js"]
