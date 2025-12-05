# Use the official Playwright image which includes all dependencies
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy application code
COPY server.js ./

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
