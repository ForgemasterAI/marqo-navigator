#!/bin/bash

# Script to start the local development environment for Marqo Navigator

# Check if the marqo-ai Docker container is running and healthy
echo "Checking if marqo-ai container is running and healthy..."
# Check for running status first
if ! docker ps --filter "name=^marqo-ai$" --filter "status=running" --format "{{.Names}}" | grep -q "^marqo-ai$"; then
  echo "marqo-ai container is not running. Starting it with docker compose..."
  # Ensure docker-compose.yaml is in the current directory or specify path
  # Start only the marqo service in detached mode
  docker compose up -d marqo
  echo "Waiting for marqo-ai to become healthy..."

  # Wait for the container to become healthy
  # Timeout after 120 seconds (adjust as needed)
  timeout=120
  interval=5
  elapsed=0
  while true; do
    health_status=$(docker inspect --format='{{.State.Health.Status}}' marqo-ai 2>/dev/null)
    if [ "$health_status" == "healthy" ]; then
      echo "marqo-ai container is healthy."
      break
    elif [ "$health_status" == "unhealthy" ]; then
       echo "Error: marqo-ai container reported unhealthy status."
       exit 1
    fi

    if [ $elapsed -ge $timeout ]; then
      echo "Error: Timeout waiting for marqo-ai container to become healthy."
      docker logs marqo-ai # Show logs for debugging
      exit 1
    fi

    sleep $interval
    elapsed=$((elapsed + interval))
    echo "Waiting... (${elapsed}s / ${timeout}s)"
  done

else
  # If already running, check health
  health_status=$(docker inspect --format='{{.State.Health.Status}}' marqo-ai 2>/dev/null)
   if [ "$health_status" == "healthy" ]; then
      echo "marqo-ai container is already running and healthy."
   elif [ "$health_status" == "starting" ]; then
       echo "marqo-ai container is running but still starting/initializing health check. Please wait."
       # Optionally add a wait loop here too if needed, similar to the one above
       sleep 10 # Simple wait
   elif [ "$health_status" == "unhealthy" ]; then
       echo "Warning: marqo-ai container is running but unhealthy. Attempting to proceed anyway..."
       # Or exit 1 if you want to stop
   else
       echo "marqo-ai container is running, but health status is unknown or not configured ($health_status)."
   fi
fi

# Start the proxy server in the background
echo "Starting the proxy server (pnpm proxy:dev)..."
pnpm proxy:dev &
PROXY_PID=$!
# Set process group ID (PGID) to the PID of the background process
# This allows killing the entire process group later
set -m # Enable job control
pgid=$(ps -o pgid= $PROXY_PID | grep -o '[0-9]*')
echo "Proxy server started with PID: $PROXY_PID, PGID: $pgid"

# Add a small delay to allow the proxy to start
sleep 3

# Function to clean up background processes
cleanup() {
    echo "Caught signal, stopping proxy server (PGID: $pgid)..."
    # Kill the process group to ensure nodemon and its children are terminated
    if kill -TERM -$pgid 2>/dev/null; then
        wait $PROXY_PID 2>/dev/null # Wait for the process group to terminate
        echo "Proxy server stopped."
    else
        echo "Proxy server might have already stopped."
    fi
    exit 0
}

# Trap signals to ensure cleanup runs
trap cleanup SIGINT SIGTERM EXIT

# Start the Vite development server in the foreground
echo "Starting the Vite development server (pnpm dev)..."
pnpm dev

# The script will wait here until 'pnpm dev' exits.
# The trap will handle cleanup when 'pnpm dev' is terminated (e.g., Ctrl+C).
# Explicitly call cleanup on exit just in case trap doesn't fire on normal exit
cleanup
