#!/usr/bin/env bash
# bundle-size.sh — reports total gzipped + brotli sizes for CSS, HTML, and JS
# Usage: ./scripts/bundle-size.sh [dist/]
set -euo pipefail

DIST="${1:-dist}"

if [ ! -d "$DIST" ]; then
  echo "ERROR: '$DIST' directory not found. Run 'pnpm build' first." >&2
  exit 1
fi

hr() { printf '%0.s─' {1..60}; printf '\n'; }
bytes_to_human() {
  local b=$1
  if   [ "$b" -ge 1048576 ]; then printf "%.1f MB" "$(echo "scale=1; $b/1048576" | bc)"
  elif [ "$b" -ge 1024 ];    then printf "%.1f KB" "$(echo "scale=1; $b/1024" | bc)"
  else printf "%d B" "$b"; fi
}

gzip_size() {
  local f=$1
  gzip -c "$f" | wc -c | tr -d ' '
}

brotli_size() {
  local f=$1
  if command -v brotli &>/dev/null; then
    brotli --stdout "$f" | wc -c | tr -d ' '
  else
    echo "n/a"
  fi
}

sum_sizes() {
  local ext=$1; local method=$2
  local total=0
  while IFS= read -r -d '' f; do
    local s
    if [ "$method" = "gzip" ]; then
      s=$(gzip_size "$f")
    else
      s=$(brotli_size "$f")
      [ "$s" = "n/a" ] && { echo "n/a"; return; }
    fi
    total=$((total + s))
  done < <(find "$DIST" -name "*.$ext" -print0)
  echo "$total"
}

echo ""
echo "  changelogs.info bundle size report"
echo "  dist: $DIST"
hr

# File counts
css_count=$(find "$DIST" -name "*.css" | wc -l | tr -d ' ')
html_count=$(find "$DIST" -name "*.html" | wc -l | tr -d ' ')
js_count=$(find "$DIST" -name "*.js" | wc -l | tr -d ' ')
font_count=$(find "$DIST" -name "*.woff2" -o -name "*.woff" | wc -l | tr -d ' ')

# Raw sizes
css_raw=$(find "$DIST" -name "*.css" -exec cat {} \; | wc -c | tr -d ' ')
html_raw=$(find "$DIST" -name "*.html" -exec cat {} \; | wc -c | tr -d ' ')
js_raw=$(find "$DIST" -name "*.js" -exec cat {} \; | wc -c | tr -d ' ')
font_raw=$(find "$DIST" \( -name "*.woff2" -o -name "*.woff" \) -exec cat {} \; | wc -c | tr -d ' ')

# Gzip totals
echo "  Calculating gzip sizes..."
css_gz=$(sum_sizes css gzip)
html_gz=$(sum_sizes html gzip)
js_gz=$(sum_sizes js gzip)

printf "  %-12s  %5s files  raw: %8s  gzip: %8s\n" \
  "CSS" "$css_count" "$(bytes_to_human $css_raw)" "$(bytes_to_human $css_gz)"
printf "  %-12s  %5s files  raw: %8s  gzip: %8s\n" \
  "HTML" "$html_count" "$(bytes_to_human $html_raw)" "$(bytes_to_human $html_gz)"
printf "  %-12s  %5s files  raw: %8s  gzip: %8s\n" \
  "JS" "$js_count" "$(bytes_to_human $js_raw)" "$(bytes_to_human $js_gz)"
printf "  %-12s  %5s files  raw: %8s  (not compressed)\n" \
  "Fonts" "$font_count" "$(bytes_to_human $font_raw)"

hr

total_raw=$((css_raw + html_raw + js_raw))
total_gz=$((css_gz + html_gz + js_gz))
printf "  %-12s  %5s files  raw: %8s  gzip: %8s\n" \
  "TOTAL (no fonts)" "" "$(bytes_to_human $total_raw)" "$(bytes_to_human $total_gz)"

hr

# Per-CSS file breakdown (top 10 by size)
echo "  Top CSS files (raw):"
find "$DIST" -name "*.css" -exec du -b {} \; 2>/dev/null | sort -rn | head -10 | while read size path; do
  shortpath="${path#$DIST/}"
  printf "    %-8s  %s\n" "$(bytes_to_human $size)" "$shortpath"
done

hr
echo ""
