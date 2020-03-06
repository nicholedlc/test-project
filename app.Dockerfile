FROM node:10-alpine

# Create app directory
WORKDIR /usr/src/app

# VOLUME /var/run/docker.sock

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 4040
CMD [ "npm", "run", "start"]
