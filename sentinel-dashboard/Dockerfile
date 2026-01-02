# Use Node 22 as we decided earlier
FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Vite runs on 5173 by default
EXPOSE 5173

# Start the dev server with --host so Docker can route the traffic
CMD ["npm", "run", "dev", "--", "--host"]