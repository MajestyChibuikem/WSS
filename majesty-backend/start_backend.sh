#!/bin/bash

# Set working directory to the backend directory
cd "$(dirname "$0")"

VENV_DIR="backend"
REQUIREMENTS="requirements.txt"

# 1. Create venv if not exists
if [ ! -d "$VENV_DIR" ]; then
  echo "[INFO] Creating virtual environment..."
  python3 -m venv $VENV_DIR
fi

# 2. Activate the virtual environment
source "$VENV_DIR/bin/activate"

# 3. Install requirements if not already installed
if [ -f "$REQUIREMENTS" ]; then
  echo "[INFO] Installing Python dependencies from $REQUIREMENTS..."
  pip install -r "$REQUIREMENTS"
else
  echo "[WARNING] $REQUIREMENTS not found. Skipping package install."
fi

# 4. Run the backend server
echo "[INFO] Starting backend..."
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=127.0.0.1 --port=5000
