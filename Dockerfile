FROM node:18-alpine AS deps
WORKDIR /app

# 1. Copy Prisma first to support postinstall
COPY prisma ./prisma

# 2. Copy dependencies and install
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 3. Build the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Production image
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
