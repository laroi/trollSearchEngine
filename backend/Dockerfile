# Start from base node alpine image
FROM node:14-alpine

# install imagemagick, graphicsmagick, ffmgeg and
RUN apk add --no-cache gettext librsvg ghostscript imagemagick
RUN apk --no-cache --virtual deps add \
  python2 \
  make \
  g++ 
WORKDIR /opt/app

COPY *.js ./
COPY *.json ./
COPY models ./models
COPY routes ./routes
COPY utils ./utils
COPY views ./views
COPY *.env.dev ./
RUN npm install

EXPOSE 3000

CMD ["node", "app.js"]








