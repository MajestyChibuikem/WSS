#!/bin/bash

# Define absolute paths (Update these paths accordingly)
BACKEND_DIR="$HOME/inventory_management_system/majesty-backend"
FRONTEND_DIR="$HOME/inventory_management_system/cedar-frontend"
VENV_DIR="$BACKEND_DIR/backend/bin/activate"

# Ensure majesty-backend exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "Error: Directory majesty-backend not found at $BACKEND_DIR"
    exit 1
fi

# Navigate to majesty-backend
cd "$BACKEND_DIR" || exit 1

# Activate the virtual environment
if [ -f "$VENV_DIR" ]; then
    source "$VENV_DIR"
else
    echo "Error: Virtual environment not found at $VENV_DIR"
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt || { echo "Failed to install dependencies"; exit 1; }
else
    echo "Warning: requirements.txt not found, skipping dependency installation"
fi

# Start Flask server in the background & detach
echo "Starting Flask server..."
flask run & disown

# Ensure cedar-frontend exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "Error: Directory cedar-frontend not found at $FRONTEND_DIR"
    exit 1
fi

# Navigate to cedar-frontend
cd "$FRONTEND_DIR" || exit 1

# Run yarn dev
echo "Starting frontend server..."
yarn dev
