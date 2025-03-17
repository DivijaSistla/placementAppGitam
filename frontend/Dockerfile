# Use a lightweight Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies (using --legacy-peer-deps to prevent conflicts)
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose the React app's port
EXPOSE 3000

# Start the React app using "serve"
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
