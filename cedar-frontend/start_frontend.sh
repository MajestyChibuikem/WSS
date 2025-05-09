#!/bin/bash

# Check if node_modules directory exists to decide whether to install dependencies
if [ ! -d "node_modules" ]; then
  echo "[INFO] Installing frontend dependencies..."
  yarn install
fi

# Start the frontend in development mode
echo "[INFO] Starting frontend..."
yarn dev
