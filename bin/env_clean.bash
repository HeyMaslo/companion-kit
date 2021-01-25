#!/bin/bash

echo "Removing generated files"

rm -f env/config.js
rm -f mobile/app.json
rm -f mobile/ios/CompanionKit/Info.plist
rm -f common/abstractions/services/app.ts
rm -f mobile/ios/CompanionKit.xcodeproj/project.pbxproj

echo "Done."
