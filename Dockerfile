FROM node:18-alpine

RUN mkdir -p /home/qtravel

WORKDIR /home/qtravel 

COPY package*.json /home/qtravel

RUN npm install

RUN npm install mongoose

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "start"]