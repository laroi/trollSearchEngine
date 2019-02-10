# Start from base node alpine image
FROM node:10-alpine

WORKDIR /opt/app

COPY *.js ./
COPY *.json ./

RUN npm install

CMD ["node", "app.js"]








