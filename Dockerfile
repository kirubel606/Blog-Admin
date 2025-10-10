# Stage 1: Build the React Vite app
FROM node:18-alpine
WORKDIR /src

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Serve the build with a lightweight web server


EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host"]