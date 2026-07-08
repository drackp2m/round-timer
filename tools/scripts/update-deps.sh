#!/bin/sh

# Packages with `ng-update` migrations must be updated via `ng update` so their
# migration schematics run; pnpm is not allowed to bump them directly.

echo "🔍 Checking for outdated packages..."
pnpm outdated
OUTDATED=$?

if [ $OUTDATED -eq 0 ]; then
  echo "✅ Everything is up to date, nothing to do."
  exit 0
fi

if [ $OUTDATED -ne 1 ]; then
  echo "❌ Failed to check for updates"
  exit 1
fi

printf "🚀 Updates available. Update now? [y/N] "
read -r ANSWER

case "$ANSWER" in
  y | Y | yes | YES) ;;
  *)
    echo "🛑 Update cancelled."
    exit 0
    ;;
esac

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working tree is not clean, commit or stash before updating."
  exit 1
fi

echo "🅰️ Updating Angular packages (with migrations)..."
pnpm exec ng update @angular/cli @angular/core

if [ $? -ne 0 ]; then
  echo "❌ Angular update failed"
  exit 1
fi

echo "🧩 Updating @ngrx/signals and angular-eslint (with migrations)..."
pnpm exec ng update @ngrx/signals angular-eslint

if [ $? -ne 0 ]; then
  echo "❌ ngrx/angular-eslint update failed"
  exit 1
fi

echo "📦 Updating remaining packages..."
pnpm up --latest '!@angular/*' '!@ngrx/*' '!angular-eslint'

if [ $? -ne 0 ]; then
  echo "❌ General update failed"
  exit 1
fi

echo "🎉 Done! Review the diff before committing."
