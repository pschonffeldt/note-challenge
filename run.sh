#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root (directory where this script lives)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Notes app – bootstrap & start"

#######################################
# 1. Backend env (.env)
#######################################
if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  echo "==> backend/.env not found, creating a template..."

  cat > "$ROOT_DIR/backend/.env" << 'EOF'
# Backend environment configuration
# IMPORTANT: Update DATABASE_URL to point to your PostgreSQL instance,
# then re-run ./run.sh

DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/notes_app"
EOF

  echo "==> Created backend/.env with a template DATABASE_URL."
  echo "   Please edit backend/.env with your real Postgres credentials, then run ./run.sh again."
  exit 1
fi

#######################################
# 2. Frontend env (.env.local)
#######################################
if [ ! -f "$ROOT_DIR/frontend/.env.local" ]; then
  echo "==> frontend/.env.local not found, creating default config..."

  cat > "$ROOT_DIR/frontend/.env.local" << 'EOF'
# Frontend environment configuration
# URL of the backend API
NEXT_PUBLIC_API_URL="http://localhost:3001"
EOF

  echo "==> Created frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:3001"
fi

#######################################
# 3. Backend: install deps, migrate, start
#######################################
echo "==> Setting up backend..."
cd "$ROOT_DIR/backend"

echo "   - Installing backend dependencies (npm install)..."
npm install

echo "   - Running Prisma migrations..."
# Uses the script defined in backend/package.json
npm run prisma:migrate:deploy

echo "   - Starting NestJS backend on http://localhost:3001 ..."
npm run start:dev &
BACKEND_PID=$!

#######################################
# 4. Frontend: install deps, start
#######################################
echo "==> Setting up frontend..."
cd "$ROOT_DIR/frontend"

echo "   - Installing frontend dependencies (npm install)..."
npm install

echo "   - Starting Next.js frontend on http://localhost:3000 ..."
npm run dev &
FRONTEND_PID=$!

#######################################
# 5. Summary
#######################################
echo ""
echo "==============================================="
echo " Backend running on:  http://localhost:3001"
echo " Frontend running on: http://localhost:3000"
echo " Press Ctrl+C to stop both."
echo "==============================================="
echo ""

# Wait for both background processes
wait $BACKEND_PID $FRONTEND_PID
