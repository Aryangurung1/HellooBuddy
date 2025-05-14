# ===== Base Image: Install dependencies =====
FROM node:18-alpine AS deps
WORKDIR /app

# Accept build-time environment variables
ARG KINDE_CLIENT_ID
ARG KINDE_CLIENT_SECRET
ARG KINDE_ISSUER_URL
ARG KINDE_SITE_URL
ARG KINDE_POST_LOGOUT_REDIRECT_URL
ARG KINDE_POST_LOGIN_REDIRECT_URL
ARG DATABASE_URL

# Expose envs at build time
ENV KINDE_CLIENT_ID=$KINDE_CLIENT_ID
ENV KINDE_CLIENT_SECRET=$KINDE_CLIENT_SECRET
ENV KINDE_ISSUER_URL=$KINDE_ISSUER_URL
ENV KINDE_SITE_URL=$KINDE_SITE_URL
ENV KINDE_POST_LOGOUT_REDIRECT_URL=$KINDE_POST_LOGOUT_REDIRECT_URL
ENV KINDE_POST_LOGIN_REDIRECT_URL=$KINDE_POST_LOGIN_REDIRECT_URL
ENV DATABASE_URL=$DATABASE_URL

COPY prisma ./prisma
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# ===== Builder Image =====
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===== Production Image =====
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
