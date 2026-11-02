FROM node:22-alpine

WORKDIR /server

RUN apk add --no-cache libc6-compat

COPY package.json turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

RUN npm install --legacy-peer-deps

COPY . .

RUN chmod +x ./start.sh ./start-storefront.sh

EXPOSE 9000 5173 8000

ENTRYPOINT ["./start.sh"]
