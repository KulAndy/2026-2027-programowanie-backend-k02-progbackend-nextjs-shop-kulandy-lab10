#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-}"
if [[ -z "$BASE_URL" ]]; then
  echo "Użycie: bash scripts/bench.sh <BASE_URL>"
  echo "Przykład: bash scripts/bench.sh https://2026-2027-programowanie-backend-k02.vercel.app"
  exit 1
fi

OUT_DIR="bench-results"
mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT="$OUT_DIR/report-$STAMP.txt"

{
  echo "=== Pomiar wydajności ==="
  echo "Data (UTC): $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "BASE_URL: $BASE_URL"
  echo

  echo "=== 1. Baseline — 5 pojedynczych żądań (cold vs warm) ==="
  echo "Endpoint: GET $BASE_URL/product-list"
  for i in 1 2 3 4 5; do
    curl -o /dev/null -s -w "próba $i: %{time_total}s (HTTP %{http_code})\n" \
      "$BASE_URL/product-list"
    sleep 1
  done
  echo

  echo "=== 2. Współbieżność 20 x 30 s — /product-list ==="
  npx --yes autocannon -c 20 -d 30 "$BASE_URL/product-list"
  echo

  echo "=== 3. Współbieżność 50 x 30 s — /product-list ==="
  npx --yes autocannon -c 50 -d 30 "$BASE_URL/product-list"
  echo

  echo "=== 4. Współbieżność 20 x 30 s — /product-list/13 ==="
  npx --yes autocannon -c 20 -d 30 "$BASE_URL/product-list/13"
  echo

  echo "=== Koniec pomiaru ==="
} 2>&1 | tee "$REPORT"

echo
echo "Raport zapisany w: $REPORT"