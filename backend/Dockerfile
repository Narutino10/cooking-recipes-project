# Multi-stage Dockerfile for development and production
FROM node:20.11-alpine3.19 AS base

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install 
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Build stage  
FROM base AS build
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM node:20.11-alpine3.19 AS production
WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /usr/src/app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main"]
