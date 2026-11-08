FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

RUN npm install -w frontend -w shared

COPY shared ./shared
COPY frontend ./frontend

WORKDIR /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
