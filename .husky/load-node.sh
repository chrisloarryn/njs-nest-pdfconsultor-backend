#!/bin/sh

set -eu

if [ -n "${NVM_DIR:-}" ] && [ -s "$NVM_DIR/nvm.sh" ]; then
  :
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  NVM_DIR="$HOME/.nvm"
  export NVM_DIR
else
  echo "nvm is required to run this git hook." >&2
  exit 1
fi

# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

if [ -f "$repo_root/.nvmrc" ]; then
  nvm use --silent >/dev/null
else
  nvm use --silent default >/dev/null
fi

export PATH="$repo_root/node_modules/.bin:$PATH"
