# ==========================================
# Stage 1: Dependencies Resolution
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ==========================================
# Stage 2: Production Minimal Runtime
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Run as unprivileged standard non-root user
USER node

# Copy dependencies and application source
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node server.js app.js ./
COPY --chown=node:node config/ ./config/
COPY --chown=node:node controllers/ ./controllers/
COPY --chown=node:node middleware/ ./middleware/
COPY --chown=node:node models/ ./models/
COPY --chown=node:node routes/ ./routes/
COPY --chown=node:node services/ ./services/
COPY --chown=node:node validators/ ./validators/
COPY --chown=node:node docs/ ./docs/
COPY --chown=node:node migrations/ ./migrations/
COPY --chown=node:node migrate-mongo-config.js ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
