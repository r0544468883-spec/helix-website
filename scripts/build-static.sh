#!/usr/bin/env bash
#
# Static-export build for the free Firebase Hosting tier.
#
# Next.js refuses to run `output: 'export'` while route handlers exist, so this
# moves app/api out of the tree, builds, and always moves it back — including on
# failure or Ctrl-C. Nothing is deleted.
#
# The resulting site in out/ has NO working forms. /api/lead, the two
# registration endpoints and the whole /ai-checker scan are gone. This is the
# free-tier trade-off; `npm run build` still produces the full server build for
# App Hosting once the project is on Blaze.
#
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
API_DIR="$ROOT/app/api"
STASH_DIR="$ROOT/.api-stash"

restore() {
  if [ -d "$STASH_DIR" ]; then
    rm -rf "$API_DIR"
    mv "$STASH_DIR" "$API_DIR"
    echo "→ restored app/api"
  fi
}
trap restore EXIT INT TERM

if [ -d "$STASH_DIR" ]; then
  echo "ERROR: $STASH_DIR already exists — a previous build died mid-flight." >&2
  echo "Inspect it and move it back to app/api manually before retrying." >&2
  exit 1
fi

echo "→ stashing app/api (static export cannot include route handlers)"
mv "$API_DIR" "$STASH_DIR"

echo "→ building static export"
STATIC_EXPORT=1 npx next build

echo
echo "✓ static site in out/  —  forms are inert in this build"
