# # Base image
# FROM node:18-alpine

# # Set the working directory
# WORKDIR /app

# # Copy the package.json and pnpm-lock.yaml first
# COPY package.json pnpm-lock.yaml ./

# # Install dependencies
# RUN npm install -g pnpm && pnpm install

# # Copy the rest of the application files
# COPY . .

# # Expose port 3000
# EXPOSE 3000

# # Start the Next.js application
# CMD ["pnpm", "run", "dev"]

# Use Node 20 for Next.js 14
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install 

# Copy all files
COPY . .

# Build application
RUN pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies
RUN pnpm install --prod

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]