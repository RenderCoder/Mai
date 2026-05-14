#!/bin/sh

# Update installed Mai skills with backup-based overwrite.
# This script is macOS-friendly and does not require Bun or Python.

set -eu

REPO_URL="https://github.com/RenderCoder/Mai"
DEFAULT_REF="main"
MAI_SKILLS="mai mai-title mai-copy mai-rich mai-product mai-brief"

CODEX_HOME_ARG=""
SKILLS_ARG=""
ALL=0
DRY_RUN=0
REF="$DEFAULT_REF"
SOURCE_ROOT=""

usage() {
  cat <<EOF
Usage:
  sh ~/.codex/skills/mai/scripts/update-installed.sh
  sh ~/.codex/skills/mai/scripts/update-installed.sh --dry-run
  sh ~/.codex/skills/mai/scripts/update-installed.sh --all

Options:
      --codex-home <path>   Codex home directory (default: \$CODEX_HOME or ~/.codex)
      --skills <list>       Comma-separated Mai skills to update (default: installed Mai skills, or mai)
      --all                 Update/install all Mai skill entries
      --repo-url <url>      GitHub repository URL (default: $REPO_URL)
      --ref <ref>           Git ref/branch/tag (default: $DEFAULT_REF)
      --source-root <path>  Use a local repository checkout instead of downloading
      --dry-run             Show what would be overwritten
  -h, --help                Show this help
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

if [ "${1:-}" != "--stage2" ]; then
  RUN_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/mai-update-run.XXXXXX")
  STAGED="$RUN_ROOT/update-installed.sh"
  cp "$0" "$STAGED"
  MAI_UPDATE_ORIGINAL_CWD=$(pwd)
  export MAI_UPDATE_ORIGINAL_CWD
  exec /bin/sh "$STAGED" --stage2 "$@"
fi

shift

while [ "$#" -gt 0 ]; do
  case "$1" in
    --codex-home)
      [ "$#" -ge 2 ] || die "--codex-home needs a path"
      CODEX_HOME_ARG="$2"
      shift 2
      ;;
    --skills)
      [ "$#" -ge 2 ] || die "--skills needs a comma-separated list"
      SKILLS_ARG="$2"
      shift 2
      ;;
    --all)
      ALL=1
      shift
      ;;
    --repo-url)
      [ "$#" -ge 2 ] || die "--repo-url needs a URL"
      REPO_URL="$2"
      shift 2
      ;;
    --ref)
      [ "$#" -ge 2 ] || die "--ref needs a branch, tag, or ref"
      REF="$2"
      shift 2
      ;;
    --source-root)
      [ "$#" -ge 2 ] || die "--source-root needs a path"
      SOURCE_ROOT="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
done

ORIGINAL_CWD="${MAI_UPDATE_ORIGINAL_CWD:-$(pwd)}"

absolute_from_original_cwd() {
  case "$1" in
    "~")
      printf "%s\n" "$HOME"
      ;;
    "~/"*)
      printf "%s/%s\n" "$HOME" "${1#~/}"
      ;;
    /*)
      printf "%s\n" "$1"
      ;;
    *)
      printf "%s/%s\n" "$ORIGINAL_CWD" "$1"
      ;;
  esac
}

is_mai_skill() {
  for skill in $MAI_SKILLS; do
    [ "$skill" = "$1" ] && return 0
  done
  return 1
}

validate_source_skill() {
  [ -d "$1" ] || die "Skill source not found: $1"
  [ -f "$1/SKILL.md" ] || die "SKILL.md not found in source: $1"
  [ -f "$1/VERSION" ] || die "VERSION not found in source: $1"
}

download_source() {
  ROOT=$(mktemp -d "${TMPDIR:-/tmp}/mai-update-source.XXXXXX")

  case "$REPO_URL" in
    https://github.com/*)
      REPO_PATH=${REPO_URL#https://github.com/}
      REPO_PATH=${REPO_PATH%.git}
      TARBALL_URL="https://codeload.github.com/$REPO_PATH/tar.gz/$REF"
      echo "Downloading $TARBALL_URL" >&2
      curl -fsSL "$TARBALL_URL" | tar -xz -C "$ROOT"
      set -- "$ROOT"/*
      FOUND=${1:-}
      [ -n "$FOUND" ] && [ -d "$FOUND" ] || die "Downloaded archive did not contain a repository"
      printf "%s\n" "$FOUND"
      ;;
    *)
      command -v git >/dev/null 2>&1 || die "Non-GitHub repo URLs require git: $REPO_URL"
      REPO_DIR="$ROOT/repo"
      git clone --depth 1 --branch "$REF" "$REPO_URL" "$REPO_DIR"
      printf "%s\n" "$REPO_DIR"
      ;;
  esac
}

select_skills() {
  if [ "$ALL" -eq 1 ]; then
    printf "%s\n" "$MAI_SKILLS"
    return
  fi

  if [ -n "$SKILLS_ARG" ]; then
    echo "$SKILLS_ARG" | tr ',' ' '
    return
  fi

  SELECTED=""
  for skill in $MAI_SKILLS; do
    if [ -e "$SKILLS_DIR/$skill" ]; then
      SELECTED="$SELECTED $skill"
    fi
  done

  if [ -n "$SELECTED" ]; then
    echo "$SELECTED"
  else
    echo "mai"
  fi
}

if [ -n "$CODEX_HOME_ARG" ]; then
  CODEX_HOME_PATH=$(absolute_from_original_cwd "$CODEX_HOME_ARG")
elif [ -n "${CODEX_HOME:-}" ]; then
  CODEX_HOME_PATH=$(absolute_from_original_cwd "$CODEX_HOME")
else
  CODEX_HOME_PATH="$HOME/.codex"
fi

SKILLS_DIR="$CODEX_HOME_PATH/skills"

if [ -n "$SOURCE_ROOT" ]; then
  SOURCE_ROOT_PATH=$(absolute_from_original_cwd "$SOURCE_ROOT")
else
  SOURCE_ROOT_PATH=$(download_source)
fi

BACKUP_ROOT="$SKILLS_DIR/.mai-update-backups/$(date -u +%Y-%m-%dT%H-%M-%S-000Z)"
if [ -e "$BACKUP_ROOT" ]; then
  BACKUP_ROOT="$BACKUP_ROOT-$$"
fi

SKILLS=$(select_skills)

if [ "$DRY_RUN" -eq 1 ]; then
  echo "Mai update dry run:"
else
  echo "Mai update:"
fi
echo "Target skills directory: $SKILLS_DIR"

for skill in $SKILLS; do
  is_mai_skill "$skill" || die "Unsupported Mai skill: $skill"
  SOURCE="$SOURCE_ROOT_PATH/skills/$skill"
  DESTINATION="$SKILLS_DIR/$skill"
  validate_source_skill "$SOURCE"

  if [ -e "$DESTINATION" ]; then
    echo "- overwrite: $skill -> $DESTINATION"
    echo "  backup: $BACKUP_ROOT/$skill"
  else
    echo "- copy: $skill -> $DESTINATION"
  fi
done

if [ "$DRY_RUN" -eq 1 ]; then
  exit 0
fi

mkdir -p "$SKILLS_DIR"

for skill in $SKILLS; do
  SOURCE="$SOURCE_ROOT_PATH/skills/$skill"
  DESTINATION="$SKILLS_DIR/$skill"
  BACKUP="$BACKUP_ROOT/$skill"
  INCOMING="$SKILLS_DIR/.mai-update-incoming-$skill-$$"

  [ ! -e "$INCOMING" ] || die "Temporary update path already exists: $INCOMING"
  if ! cp -R "$SOURCE" "$INCOMING"; then
    die "Failed to copy $skill into $DESTINATION"
  fi

  if [ -e "$DESTINATION" ]; then
    mkdir -p "$BACKUP_ROOT"
    mv "$DESTINATION" "$BACKUP"
  fi

  if ! mv "$INCOMING" "$DESTINATION"; then
    if [ -e "$BACKUP" ] && [ ! -e "$DESTINATION" ]; then
      mv "$BACKUP" "$DESTINATION"
    fi
    die "Failed to move $skill into $DESTINATION"
  fi
done

echo
echo "Restart Codex to pick up the updated skills."
