#!/usr/bin/env bash
# Runs each time the dev container starts.
# Ensures Prisma client is in sync with the schema.
set -euo pipefail

echo "==> Ensuring Prisma client is up to date..."
cd /workspace/backend
pnpm exec prisma generate --no-hints 2>/dev/null || true

echo "==> Ready. Run 'pnpm dev' from the workspace root to start frontend + backend."
