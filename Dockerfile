FROM node:18-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN useradd --create-home appuser
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
