FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN apk add --no-cache openssl && corepack enable && pnpm install

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm prisma:generate && pnpm build
EXPOSE 4000
CMD ["pnpm", "start"]
