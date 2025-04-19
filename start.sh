#!/bin/bash

# Navigate to majesty-backend
cd majesty-backend || { echo "Directory majesty-backend not found"; exit 1; }

python3 -m venv backend
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

# Navigate to cedar-frontend
cd ../cedar-frontend || { echo "Directory cedar-frontend not found"; exit 1; }

# Run yarn dev
yarn dev
