FROM node:18
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . ./

RUN npm run build:production

EXPOSE 3031

CMD ["npm", "run", "start:production"]