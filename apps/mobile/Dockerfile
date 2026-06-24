FROM node:22-bookworm-slim AS build

WORKDIR /app

ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_APP_NAME

ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_APP_NAME=$EXPO_PUBLIC_APP_NAME

COPY package.json ./
RUN npm install && npx expo install expo-asset expo-font

COPY . .
RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

CMD ["sh", "-c", "serve dist -s -l ${PORT:-8080}"]
