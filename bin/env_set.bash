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

echo "Done."
