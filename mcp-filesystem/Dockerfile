
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY wrapper.js .
EXPOSE 8001
CMD ["npm", "start"]