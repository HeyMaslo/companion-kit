#!/bin/bash

# Perform substitution operations in the node environment
# local values in the .env file are preferred
_set_ () {
    input=$1;output=$2
    envsub --env-file .env --all "$input" "$output"
}

echo "Setting values"

_set_ env/config-template.js                                        env/config.js
_set_ mobile/app-template.json                                      mobile/app.json
_set_ mobile/ios/CompanionKit/Info-template.plist                   mobile/ios/CompanionKit/Info.plist
_set_ common/abstractions/services/app-template.ts                  common/abstractions/services/app.ts
_set_ mobile/ios/CompanionKit.xcodeproj/project-template.pbxproj    mobile/ios/CompanionKit.xcodeproj/project.pbxproj
_set_ mobile/ios/CompanionKit/CompanionKit-template.entitlements    mobile/ios/CompanionKit/CompanionKit.entitlements
_set_ mobile/android/sentry-template.properties                     mobile/android/sentry.properties
_set_ mobile/ios/sentry-template.properties                         mobile/ios/sentry.properties
_set_ server/functions/src/services/config/app-template.ts          server/functions/src/services/config/app.ts
_set_ server/functions/.runtimeconfig-template.json                 server/functions/.runtimeconfig.json
_set_ server/.firebaserc-template                                   server/.firebaserc
_set_ common/models/ClientCard.ts.template                          common/models/ClientCard.ts

echo "Done."
