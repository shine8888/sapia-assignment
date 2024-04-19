# Application Docker file Configuration
# Visit https://docs.docker.com/engine/reference/builder/
# Using multi stage build

# Prepare the image when build
# also use to minimize the docker image
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN npm run build


# Build the image as production
# So we can minimize the size
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
ENV PORT=8888
ENV NODE_ENV=Production
RUN yarn install
COPY --from=builder /app/dist ./dist
EXPOSE ${PORT}

CMD ["npm", "run", "start"]