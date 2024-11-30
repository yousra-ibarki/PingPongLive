import subprocess

# Define the shell command to run Gunicorn
command = ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "myproject.asgi:application", "-b", "0.0.0.0:8000"]

# Run the command
subprocess.run(command)
