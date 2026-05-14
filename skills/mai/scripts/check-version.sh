#!/bin/sh

# Check the installed Mai version with macOS default shell tools.

set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
SKILL_DIR=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)
VERSION_FILE="$SKILL_DIR/VERSION"
WORKFLOW_FILE="$SKILL_DIR/references/workflow.md"
LATEST_VERSION_URL="${MAI_LATEST_VERSION_URL:-https://raw.githubusercontent.com/RenderCoder/Mai/main/skills/mai/VERSION}"

version_gt() {
  left_a=$(printf "%s" "$1" | awk -F. '{print $1 + 0}')
  left_b=$(printf "%s" "$1" | awk -F. '{print $2 + 0}')
  left_c=$(printf "%s" "$1" | awk -F. '{print $3 + 0}')
  right_a=$(printf "%s" "$2" | awk -F. '{print $1 + 0}')
  right_b=$(printf "%s" "$2" | awk -F. '{print $2 + 0}')
  right_c=$(printf "%s" "$2" | awk -F. '{print $3 + 0}')

  [ "$left_a" -gt "$right_a" ] && return 0
  [ "$left_a" -lt "$right_a" ] && return 1
  [ "$left_b" -gt "$right_b" ] && return 0
  [ "$left_b" -lt "$right_b" ] && return 1
  [ "$left_c" -gt "$right_c" ] && return 0
  return 1
}

[ -f "$VERSION_FILE" ] || {
  echo "Error: VERSION not found: $VERSION_FILE" >&2
  exit 1
}

VERSION=$(cat "$VERSION_FILE")
LATEST_VERSION="${MAI_LATEST_VERSION:-unknown}"
if [ "$LATEST_VERSION" = "unknown" ] && command -v curl >/dev/null 2>&1; then
  LATEST_VERSION=$(curl -fsSL "$LATEST_VERSION_URL" 2>/dev/null || true)
  LATEST_VERSION=$(printf "%s" "$LATEST_VERSION" | tr -d '[:space:]')
  [ -n "$LATEST_VERSION" ] || LATEST_VERSION="unknown"
fi

echo "Mai installed version: $VERSION"
echo "Latest GitHub version: $LATEST_VERSION"

UPDATE_AVAILABLE="unknown"
if [ "$LATEST_VERSION" = "unknown" ]; then
  echo "Update available: unknown"
elif version_gt "$LATEST_VERSION" "$VERSION"; then
  UPDATE_AVAILABLE="yes"
  echo "Update available: yes"
else
  UPDATE_AVAILABLE="no"
  echo "Update available: no"
fi

echo "Skill directory: $SKILL_DIR"

if [ -f "$WORKFLOW_FILE" ] && grep -q "双反思产出硬约束" "$WORKFLOW_FILE"; then
  echo "Double-reflection workflow: yes"
else
  echo "Double-reflection workflow: no"
fi

if [ -f "$WORKFLOW_FILE" ] && grep -q "命令行可读性硬约束" "$WORKFLOW_FILE"; then
  echo "CLI-friendly preview: yes"
else
  echo "CLI-friendly preview: no"
fi

if [ -f "$WORKFLOW_FILE" ] && grep -q "中文优先硬约束" "$WORKFLOW_FILE"; then
  echo "Chinese-first copy: yes"
else
  echo "Chinese-first copy: no"
fi

if [ -f "$WORKFLOW_FILE" ] && grep -q "长单词排版硬约束" "$WORKFLOW_FILE"; then
  echo "Short-word layout: yes"
else
  echo "Short-word layout: no"
fi

if [ "$LATEST_VERSION" = "unknown" ]; then
  echo
  echo "Could not confirm the latest GitHub version."
  echo "To force an update, exit Codex first, then run:"
  echo "sh ~/.codex/skills/mai/scripts/update-installed.sh"
elif [ "$UPDATE_AVAILABLE" = "yes" ]; then
  echo
  echo "A newer Mai version is available."
  echo "Exit Codex first, then run this in your system terminal:"
  echo "sh ~/.codex/skills/mai/scripts/update-installed.sh"
fi
