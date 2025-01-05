#!/bin/bash

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "Local IP address: $LOCAL_IP"

# Update .env file
echo "# Backend server URL (use localhost for browser testing)
EXPO_PUBLIC_BACKEND_URL=http://$LOCAL_IP:3000

# Other environment variables can be added here" > .env

echo "Updated .env with correct IP address"

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
else
    # Linux
    fuser -k 3000/tcp 2>/dev/null || true
fi

# Clear React Native cache
echo "Clearing React Native cache..."
rm -rf node_modules/.cache
watchman watch-del-all 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Install dependencies and start server
# echo "Starting server..."
# cd server-OLD
# npm install

# # Start the server in the background
# npm start &
# SERVER_PID=$!

# # Wait for server to start
# echo "Waiting for server to start..."
# for i in {1..30}; do
#     if curl -s http://localhost:3000/api/status > /dev/null; then
#         echo "Server is up!"
#         break
#     fi
#     sleep 1
#     if [ $i -eq 30 ]; then
#         echo "Server failed to start within 30 seconds"
#         kill $SERVER_PID
#         exit 1
#     fi
#     echo -n "."
# done

# cd ..

# # Start React Native app with clean cache
# echo "Starting React Native app..."
# EXPO_PUBLIC_BACKEND_URL=http://$LOCAL_IP:3000 npm start -- --clear

# # Cleanup on script exit
# trap 'kill $SERVER_PID 2>/dev/null' EXIT
