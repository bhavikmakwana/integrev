# Root Dockerfile for Render / single-image deployment

# Stage 1: Install backend dependencies
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production

# Stage 2: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend .
RUN npx parcel build src/index.html --dist-dir dist

# Stage 3: Final image containing backend and static frontend
FROM node:20-alpine AS runtime
WORKDIR /app/backend

# Copy backend source and installed modules
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend .

# Copy built frontend into backend static folder
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "index.js"]
