# ===== Base Image: Install dependencies =====
FROM node:18-alpine AS deps
WORKDIR /app

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
