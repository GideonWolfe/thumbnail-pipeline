FROM node:latest

WORKDIR /usr/src/app

# copy package info into app
COPY app/package*.json ./
# install packages
RUN npm install

# Copy app source
COPY app/ .

EXPOSE 8080

CMD [ "node", "server.js" ]
