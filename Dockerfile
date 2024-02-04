# Use an official Node.js runtime as a parent image
FROM node:16.9.0-alpine

# Set the working directory in the container
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# first build the library and then the app
RUN npm run build:libs
CMD ["npm", "start:dev"]
