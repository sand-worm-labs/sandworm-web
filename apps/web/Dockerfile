# Use Node 20.10 Alpine
FROM node:20.10-alpine

# Set working directory
WORKDIR /usr/app

# Install Yarn globally
RUN corepack enable

# Copy package.json and yarn.lock to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Change ownership to the non-root user
RUN chown -R node:node /usr/app

# Copy the rest of the app files
COPY ./ ./

# Build app if needed
# RUN yarn build

# Expose port
EXPOSE 3000

# Run container as non-root user
USER node

# Launch app with PM2
CMD ["pm2-runtime", "start", "npm", "--", "run", "dev"]]
