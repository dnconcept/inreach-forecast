# Use Node.js 20 base image
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Install Yarn globally
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the Angular application
RUN yarn build --prod

# Use a lightweight web server to serve the built app
FROM nginx:alpine
COPY --from=build /app/dist/windy-routing /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

