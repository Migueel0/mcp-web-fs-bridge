FROM mcr.microsoft.com/playwright:v1.44.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY wrapper.js .
EXPOSE 8002
CMD ["npm", "start"]