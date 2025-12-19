FROM node:18-alpine
WORKDIR /usr/src/app

# Install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy app
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
