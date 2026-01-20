#!/usr/bin/env bash
# Preview files that match cleanup rules (safe: does not delete)
# Run from repo root: ./tools/preview-deletions.sh

set -euo pipefail

echo "Scanning repository for files matching cleanup patterns..."

grep_patterns=(
  "\.md$"
  "\.env"
  "node_modules/"
  "\\.next/"
  "(^|/)tests(/|$)"
  "(^|/)__tests__(/|$)"
  "\.log$"
  "\.DS_Store$"
  "Thumbs.db$"
  "(^|/)scripts(/|$)"
  "(^|/)docs(/|$)"
  "(^|/)playwright-report(/|$)"
  "(^|/)test-results(/|$)"
  "screenshots/"
  "\\.sqlite$"
  "\\.sql$"
  "\\.py$"
  "\\.ts$"
)

# Use git ls-files + find for untracked files to create a full listing
echo "\nTracked files matching patterns (git ls-files):"
for p in "${grep_patterns[@]}"; do
  git ls-files | grep -E "$p" || true
done

echo "\nUntracked files matching patterns (find):"
for p in "${grep_patterns[@]}"; do
  find . -type f -regextype posix-extended -regex ".*$p" -not -path './.git/*' -print || true
done

echo "\nNote: README.md and LICENSE.md are explicitly kept. .env.example is kept. This script is preview-only and will not modify the repo."

exit 0
