#!/bin/bash

echo "Removing generated files"

rm -f env/config.js
rm -f mobile/app.json
rm -f mobile/ios/CompanionKit/Info.plist
rm -f common/abstractions/services/app.ts
rm -f mobile/ios/CompanionKit.xcodeproj/project.pbxproj
rm -f smobile/ios/CompanionKit/CompanionKit.entitlements
rm -f server/functions/src/services/config/app.ts
rm -f server/.firebaserc
rm -f server/functions/.runtimeconfig.json
rm -f mobile/android/sentry.properties
rm -f mobile/ios/sentry.properties
rm -f common/models/ClientCard.ts

echo "Done."
