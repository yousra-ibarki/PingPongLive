
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


# ---------- SEPARATE THE PRODUCTION IMAGE TO BE LIGHTWEIGHT ----------

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

# accept the environment variables
ARG NODE_ENV
ARG FRONT_PORT

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV FRONT_PORT={FRONT_PORT}

# Install production dependencies
RUN pnpm install --prod


# Start the application
CMD ["pnpm", "start"]