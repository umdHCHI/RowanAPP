
#!/bin/bash

# Ensure .env exists
if [ ! -f .env ]; then
  echo ".env file not found. Please create one with your EXPO_TOKEN."
  exit 1
fi

# Build Docker image
docker build -t expo-deploy .

# Run Docker container with environment variables from .env
docker run --rm --env-file .env expo-deploy
