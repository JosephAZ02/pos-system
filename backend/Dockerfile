FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

RUN npm install -w backend -w shared

COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
