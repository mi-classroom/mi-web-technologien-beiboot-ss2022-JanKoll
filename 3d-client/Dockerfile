FROM node:lts-alpine

WORKDIR /3d-client

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "serve"]