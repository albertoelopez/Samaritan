FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Default command
CMD ["npm", "run", "dev"]
