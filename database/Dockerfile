FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Script to run migrations and seed
CMD sh -c "npx prisma migrate deploy && npx prisma db seed"
