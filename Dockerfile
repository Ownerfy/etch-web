# Use the updated VS Code dev container image for JavaScript/Node.js
FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package*.json ./
COPY yarn.lock ./

# Install Yarn
RUN npm install -g yarn

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code to the container
COPY . .

# Expose the port your application runs on
EXPOSE 5173

# Start the application using Yarn
CMD ["yarn", "run", "preview", "--", "--host"]
