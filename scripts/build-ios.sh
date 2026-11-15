#!/bin/bash
# Copy the website into the iOS app and sync it into the Xcode project.
# Run after any site change you want in the app:  scripts/build-ios.sh
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/build-pages.py
rm -rf ios-app/www && mkdir -p ios-app/www
cp -R index.html learn.html library.html 404.html privacy.html support.html \
      manifest.webmanifest css js fonts icons ios-app/www/
cd ios-app
[ -d node_modules ] || npm install --no-audit --no-fund
[ -d ios ] || npx cap add ios
npx cap sync ios
echo "Done. Open in Xcode with:  open ios-app/ios/App/App.xcodeproj"
