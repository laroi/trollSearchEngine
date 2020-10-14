FROM nginx:alpine

# install imagemagick, graphicsmagick, ffmgeg and

WORKDIR /var/www

COPY *.js ./
COPY *.html ./
COPY *.webmanifest ./
COPY fonts ./fonts
COPY icons ./icons
COPY image ./image
COPY scripts ./scripts
COPY libs ./libs
COPY styles ./styles
COPY config/nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]








