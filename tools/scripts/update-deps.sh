#!/bin/sh

# Packages with `ng-update` migrations must be updated via `ng update` so their
# migration schematics run; pnpm is not allowed to bump them directly.

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
