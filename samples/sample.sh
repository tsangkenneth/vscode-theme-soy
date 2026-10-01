#!/usr/bin/env bash
set -euo pipefail

readonly OUT_DIR="${1:-dist}"

# Builds every theme into $OUT_DIR.
build() {
  local count=0
  for file in themes/*.json; do
    cp "$file" "$OUT_DIR/" && count=$((count + 1))
  done
  echo "Copied $count files\n" >&2
}

if [[ -d "$OUT_DIR" ]]; then
  build "$@" | tee build.log
fi
