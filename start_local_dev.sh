#!/bin/bash

# Script to start the local development environment for Marqo Navigator 🚀

# Check if the marqo-ai Docker container is running and healthy
echo "🔎 Checking if marqo-ai container is running and healthy..."
# Check for running status first
if ! docker ps --filter "name=^marqo-ai$" --filter "status=running" --format "{{.Names}}" | grep -q "^marqo-ai$"; then
  echo "🐳 marqo-ai container is not running. Starting it with docker compose..."
  # Ensure docker-compose.yaml is in the current directory or specify path
  # Start only the marqo service in detached mode
  docker compose up -d marqo
  echo "⏳ Waiting for marqo-ai to become healthy..."

  # Wait for the container to become healthy
  # Timeout after 120 seconds (adjust as needed)
  timeout=120
  interval=5
  elapsed=0
  while true; do
    health_status=$(docker inspect --format='{{.State.Health.Status}}' marqo-ai 2>/dev/null)
    if [ "$health_status" == "healthy" ]; then
      echo "✅ marqo-ai container is healthy."
      break
    elif [ "$health_status" == "unhealthy" ]; then
       echo "❌ Error: marqo-ai container reported unhealthy status."
       exit 1
    fi

    if [ $elapsed -ge $timeout ]; then
      echo "❌ Error: Timeout waiting for marqo-ai container to become healthy."
      docker logs marqo-ai # Show logs for debugging
      exit 1
    fi

    sleep $interval
    elapsed=$((elapsed + interval))
    echo "⏳ Waiting... (${elapsed}s / ${timeout}s)"
  done

else
  # If already running, check health
  health_status=$(docker inspect --format='{{.State.Health.Status}}' marqo-ai 2>/dev/null)
   if [ "$health_status" = "healthy" ]; then
      echo "✅ marqo-ai container is already running and healthy."
   elif [ "$health_status" = "starting" ]; then
       echo "⏳ marqo-ai container is running but still starting/initializing health check. Please wait."
       # Optionally add a wait loop here too if needed, similar to the one above
       sleep 10 # Simple wait
   elif [ "$health_status" = "unhealthy" ]; then
       echo "⚠️ Warning: marqo-ai container is running but unhealthy. Attempting to proceed anyway..."
       # Or exit 1 if you want to stop
   else
       echo "ℹ️ marqo-ai container is running, but health status is unknown or not configured ($health_status)."
   fi
fi

# Define the proxy port
PROXY_PORT=9882

# Check if the proxy port is already in use and kill the process if found
echo "🔌 Checking if port $PROXY_PORT is in use..."
# Use lsof to find the PID listening on the TCP port. -t gives only the PID.
# Redirect errors to /dev/null in case lsof isn't installed or fails.
LISTENING_PID=$(lsof -t -i TCP:$PROXY_PORT -s TCP:LISTEN 2>/dev/null)

if [ -n "$LISTENING_PID" ]; then
    echo "⚠️ Port $PROXY_PORT is already in use by PID $LISTENING_PID. Attempting to kill it..."
    # Attempt graceful termination first
    kill -TERM $LISTENING_PID 2>/dev/null
    sleep 1 # Give it a moment to terminate
    # Check if it's still alive, force kill if necessary
    if kill -0 $LISTENING_PID 2>/dev/null; then
        echo "🔪 Process $LISTENING_PID did not terminate gracefully, sending SIGKILL..."
        kill -KILL $LISTENING_PID 2>/dev/null
        sleep 1 # Give it a moment after force kill
    fi

    # Final check
    if lsof -t -i TCP:$PROXY_PORT -s TCP:LISTEN 2>/dev/null; then
         echo "❌ Error: Failed to kill process $LISTENING_PID using port $PROXY_PORT. Please kill it manually."
         exit 1
    else
         echo "✅ Successfully killed process $LISTENING_PID."
    fi
else
    echo "✅ Port $PROXY_PORT is free."
fi

# Start the proxy server in the background
echo "🚀 Starting the proxy server (pnpm proxy:dev)..."
set -m # Enable Job Control, needed for killing the process group
pnpm proxy:dev &
PROXY_PID=$!
# Give the process a moment to potentially start children (like nodemon)
sleep 1
# Get the Process Group ID (PGID) of the background process
# Killing the PGID ensures the main process and any children it spawns (like nodemon's node process) are terminated.
pgid=$(ps -o pgid= $PROXY_PID | tr -d ' ') # Use tr to remove potential whitespace
echo "🔗 Proxy server started with PID: $PROXY_PID, PGID: $pgid"

# Add a small delay to allow the proxy to fully initialize if needed
sleep 2

# Function to clean up background processes
cleanup() {
    echo "🧹 Caught signal or exiting, stopping proxy server process group (PGID: $pgid)..."
    # Kill the entire process group using the negative PGID
    # This sends SIGTERM to all processes in the group (pnpm, nodemon, node, etc.)
    if kill -TERM -$pgid 2>/dev/null; then
        # Wait for the original background process to terminate
        # This might not wait for all children, but kill should handle them
        wait $PROXY_PID 2>/dev/null
        echo "🛑 Proxy server process group signaled for termination."
    else
        echo "🤷 Proxy server process group might have already stopped."
    fi
    # Disable job control before exiting the cleanup function if it was enabled here
    # set +m # Uncomment if set -m was only needed temporarily, but it's fine script-wide here
    exit 0
}

# Trap signals (Ctrl+C, termination) and script exit to ensure cleanup runs
trap cleanup SIGINT SIGTERM EXIT

# Start the Vite development server in the foreground
echo "⚡ Starting the Vite development server (pnpm dev)..."
# Note: pnpm dev runs in the foreground. When it exits (e.g., Ctrl+C),
# the script continues, and the EXIT trap triggers the cleanup function.
pnpm dev
