# Use CMD to specify the command to run the app
# Use the node 18-alpine image for a smaller image size
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to install dependencies with yarn
COPY package.json yarn.lock ./

# Install dependencies with yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Expose the application port
EXPOSE 8083

# Set the command to run the application and seed the database
CMD ["sh", "-c", "yarn start:prod"]