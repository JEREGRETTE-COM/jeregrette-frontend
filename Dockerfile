# syntax=docker/dockerfile:1
# Image de production pour jeregrette.com (Next.js 16, sortie "standalone").
#
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://jeregrette.com -t jeregrette-front .
#   docker run -p 3000:3000 -e API_URL=https://jeregrette-api.benrango.com/api jeregrette-front

FROM node:22-alpine AS deps
WORKDIR /app
# Les deux fichiers seuls : cette couche est réutilisée tant qu'ils ne bougent pas.
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Une variable NEXT_PUBLIC_ est inscrite dans le JavaScript envoyé au navigateur :
# elle doit donc être connue ici, à la construction, et pas au démarrage.
ARG NEXT_PUBLIC_SITE_URL=https://jeregrette.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Un compte sans privilèges : le serveur ne tourne jamais en root.
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Variables lues au démarrage, à fournir avec -e ou dans docker-compose :
#   API_URL        adresse de l'API Laravel (obligatoire)
#   AVATAR_UPLOAD  1 quand POST /users/me/avatar existe côté backend
CMD ["node", "server.js"]
