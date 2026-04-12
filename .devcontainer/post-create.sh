#!/usr/bin/env bash
# Runs once after the dev container is created.
# Installs dependencies and sets up the database.
set -euo pipefail

echo "==> Installing all workspace dependencies..."
cd /workspace
pnpm install

echo "==> Generating Prisma client..."
cd /workspace/backend
pnpm exec prisma generate

echo "==> Pushing database schema..."
pnpm exec prisma db push --skip-generate

echo "==> Dev container setup complete!"
echo "    Run 'pnpm dev' from the workspace root to start everything."
