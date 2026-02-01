#!/bin/bash

# Navigate to the correct directory
cd "$(dirname "$0")"

# Clear any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clear cache
echo "Clearing npm cache..."
rm -rf node_modules/.cache

# Start the development server
echo "Starting development server..."
BROWSER=none npm start
