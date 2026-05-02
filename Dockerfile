FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm install --legacy-peer-deps

COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

ENV VITE_API_URL=https://teamflow-api-223381093044.us-central1.run.app
RUN cd packages/shared && npx tsc --outDir dist || true
RUN cd apps/web && npm run build

FROM nginx:alpine
# Need to use custom nginx config to listen on 8080 and route history API
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
RUN sed -i 's/listen  *80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
