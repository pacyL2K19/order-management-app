FROM node:16.9.0-alpine

# Set the working directory inside the container
WORKDIR /app

COPY package.json **/yarn.lock /app/
COPY tsconfig*.json /app/

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . /app/

EXPOSE 8001

CMD ["npm", "run", "start:dev"]
