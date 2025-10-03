FROM nodered/node-red:4.0.5

## As /data is usually going to be used to provide the node-red flows, we change the cache
## to another directory, since when mounting /data the cache will be lost
USER root

RUN mkdir -p /npm_cache && \
  chown node-red:node-red /npm_cache && \
  npm config set cache /npm_cache --global

USER node-red

RUN npm install --save @statuscompliance/status@latest  @statuscompliance/control-flow@latest  @statuscompliance/extraction@latest  @statuscompliance/filtering@latest @statuscompliance/integration@latest  @statuscompliance/logic@latest  @statuscompliance/validation@latest

COPY settings.js /data/settings.js

EXPOSE 1880


CMD ["node-red"]