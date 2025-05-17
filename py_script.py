import subprocess
import os
import signal
import sys
from pathlib import Path

flask_process = None

def cleanup(signum=None, frame=None):
    print("Stopping processes...")
    if flask_process and flask_process.poll() is None:
        flask_process.terminate()
        flask_process.wait()
        print(f"Flask process ({flask_process.pid}) killed.")
    sys.exit(0)

# Register the cleanup function to run on SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, cleanup)

# Navigate to majesty-backend
backend_path = Path("majesty-backend")
if not backend_path.exists():
    print("Directory majesty-backend not found")
    sys.exit(1)

os.chdir(backend_path)

# Activate the virtual environment (simulate by modifying env vars)
venv_bin = Path("backend/bin")  # FIXED: relative to current working dir
python_exec = venv_bin / "python"
pip_exec = venv_bin / "pip"

if not python_exec.exists() or not pip_exec.exists():
    print(f"Virtual environment not found in {venv_bin}")
    sys.exit(1)

# Update PATH so the venv's Python and pip are used
env = os.environ.copy()
env["PATH"] = f"{venv_bin}:{env['PATH']}"

# Start Flask app in background
flask_process = subprocess.Popen([str(python_exec), "-m", "flask", "run"], env=env)
print(f"Flask started with PID {flask_process.pid}")

# Navigate to cedar-frontend
frontend_path = Path("../cedar-frontend").resolve()
if not frontend_path.exists():
    print("Directory cedar-frontend not found")
    cleanup()

os.chdir(frontend_path)

# Run yarn dev in the foreground
try:
    subprocess.run(["yarn", "dev"])
except KeyboardInterrupt:
    pass
finally:
    cleanup()
