FROM node:22-alpine AS base

FROM base AS deps
#RUN apk add --no-cache libc6-compat
#ENV NODE_TLS_REJECT_UNAUTHORIZED=0
#COPY cacert.pem /usr/local/share/ca-certificates/my-ca-cert.crt
#RUN update-ca-certificates
#ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/my-ca-cert.crt

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]