# ---------- Base image ----------
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY entrypoint.sh ./
RUN chmod +x /entrypoint.sh

# Remove dev dependencies for production
RUN npm prune --omit=dev

# ---------- Environment ----------
ENV PORT=4800

# Your app MUST listen on process.env.PORT
EXPOSE 4800

# ---------- Start app ----------
ENTRYPOINT ["./entrypoint.sh"]