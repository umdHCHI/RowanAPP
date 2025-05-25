
# Use official lightweight Node image
FROM node:18-alpine

# Install global tools
RUN npm install -g expo-cli eas-cli

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy app source code
COPY . .

# Default command for deployment
CMD ["sh", "-c", "eas login --token $EXPO_TOKEN && eas update --branch prod --non-interactive"]
