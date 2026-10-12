FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node server/*.mjs ./server/
COPY --chown=node:node src/lib/catalog-schema.mjs ./src/lib/
COPY --chown=node:node src/data/properties.json ./src/data/
RUN mkdir /data && chown node:node /data
USER node
ENV HOST=0.0.0.0 PORT=8787 DATA_DIR=/data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8787/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/lead-proxy.mjs"]
