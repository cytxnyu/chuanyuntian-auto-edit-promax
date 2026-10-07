#!/usr/bin/bash
set -euo pipefail
# Usage: bash ROLLBACK.sh /absolute/path/to/a/second/runtime/copy
# Restores only the five documented source adaptations into that copy.
DIR="$(cd -- "${BASH_SOURCE[0]%/*}" && pwd)"
ROOT="$(cd -- "$DIR/../.." && pwd)"
test "$#" -eq 1
exec python "$ROOT/scripts/sources/video-shotcraft-rollback.py" "$1"
