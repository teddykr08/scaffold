#!/usr/bin/env bash
# Safe cleanup script (does NOT delete by default)
# Usage:
# 1) Review preview output: ./tools/preview-deletions.sh
# 2) Run this script with --dry-run to see actions, or omit to execute move and print git commands to run.

set -euo pipefail

DRY_RUN=true
if [[ "${1:-}" == "--apply" ]]; then
  DRY_RUN=false
fi

ARCHIVE_DIR="archive_cleanup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "Archive dir: $ARCHIVE_DIR"

# Patterns to move (be conservative)
patterns=(
  "*.md"
  "*.log"
  "*.log.*"
  "*.sql"
  "*.sqlite"
  "*.py"
  "tests"
  "__tests__"
  "playwright-report"
  "test-results"
  "screenshots"
  "scripts"
  "docs"
  ".env.local"
  "Thumbs.db"
  ".DS_Store"
)

move_file() {
  src="$1"
  dest="$ARCHIVE_DIR/$src"
  dest_dir=$(dirname "$dest")
  mkdir -p "$dest_dir"
  if $DRY_RUN; then
    echo "[DRY-RUN] mv '$src' -> '$dest'"
  else
    echo "Moving '$src' -> '$dest'"
    git rm --cached -r "$src" 2>/dev/null || true
    mv "$src" "$dest"
  fi
}

# Collect candidate files/directories (conservative)
candidates=()
for p in "${patterns[@]}"; do
  # Use globbing for top-level matches and find for recursive
  while IFS= read -r -d $'\0' f; do
    # Skip README.md, LICENSE.md and .env.example
    base=$(basename "$f")
    if [[ "$base" == "README.md" || "$base" == "LICENSE.md" || "$base" == ".env.example" ]]; then
      continue
    fi
    candidates+=("$f")
  done < <(find . -path './.git' -prune -o -name "$p" -print0)
done

# De-dup
IFS=$'\n' sorted=($(printf "%s\n" "${candidates[@]}" | sort -u))

if [[ ${#sorted[@]} -eq 0 ]]; then
  echo "No candidate files found."
  exit 0
fi

echo "Found ${#sorted[@]} candidate paths."
for f in "${sorted[@]}"; do
  move_file "${f#./}"
done

if $DRY_RUN; then
  echo "\nDRY-RUN complete. To execute moves, run this script with --apply"
  echo "After moving, run git add .gitignore $ARCHIVE_DIR && git commit -m 'Move unneeded files to archive' && git push"
else
  echo "\nMove complete. Run the following to commit changes:\n"
  echo "git add .gitignore $ARCHIVE_DIR"
  echo "git commit -m \"Move unneeded files to archive\""
  echo "git push"
fi

exit 0
