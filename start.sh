#!/bin/bash

# Function to clean up on exit
cleanup() {
  echo "Stopping processes..."
  if [[ -n "$FLASK_PID" ]]; then
    kill "$FLASK_PID" 2>/dev/null
    echo "Flask process ($FLASK_PID) killed."
  fi
  exit 0
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# Navigate to majesty-backend
cd majesty-backend || { echo "Directory majesty-backend not found"; exit 1; }

# Activate the virtual environment
if [ -f "backend/bin/activate" ]; then
    source backend/bin/activate
else
    echo "Virtual environment not found in backend/bin/activate"
    exit 1
fi

# Install dependencies
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt || { echo "Failed to install dependencies"; exit 1; }
else
    echo "requirements.txt not found, skipping dependency installation"
fi

# Run Flask in the background
flask run &
FLASK_PID=$!
echo "Flask started with PID $FLASK_PID"

# Navigate to cedar-frontend
cd ../cedar-frontend || { echo "Directory cedar-frontend not found"; kill "$FLASK_PID"; exit 1; }

# Run yarn dev
yarn dev

# When yarn dev exits, clean up Flask
cleanup
