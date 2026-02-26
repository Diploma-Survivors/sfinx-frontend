#!/usr/bin/env bash
# Run sfinx-frontend locally for development
# Frontend runs on http://localhost:3001 (API: backend at :3000)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check .env.local exists
if [[ ! -f .env.local ]]; then
  echo "Error: .env.local not found. Copy from .env.example and configure:"
  echo "  cp .env.example .env.local"
  exit 1
fi

# Install dependencies if needed
if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting sfinx-frontend on http://localhost:3001"
echo "Ensure backend is running on http://localhost:3000"
npm run dev -- -p 3001
