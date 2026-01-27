FROM node:20-alpine

# Build dependencies for sharp (libvips)
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV DATA_PATH=/data
EXPOSE 3000
USER node
CMD ["node", "app.js"]
