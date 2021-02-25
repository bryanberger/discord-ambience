FROM node:14.15.1-alpine3.12

RUN apk add --no-cache python3 make git curl g++

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "node", "index.js" ]
