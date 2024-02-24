FROM nodered/node-red

RUN npm install --save @alvarobc2412/status

COPY settings.js /data/settings.js

EXPOSE 1880