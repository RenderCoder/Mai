#!/bin/sh

# Check the installed Mai version with macOS default shell tools.

set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
SKILL_DIR=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)
VERSION_FILE="$SKILL_DIR/VERSION"
WORKFLOW_FILE="$SKILL_DIR/references/workflow.md"

[ -f "$VERSION_FILE" ] || {
  echo "Error: VERSION not found: $VERSION_FILE" >&2
  exit 1
}

VERSION=$(cat "$VERSION_FILE")

echo "Mai installed version: $VERSION"
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
