# Base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml first
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install && pnpm add web-vitals prometheus-client

# Copy the rest of the application files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the Next.js application
CMD ["pnpm", "run", "dev"]
