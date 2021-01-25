#!/bin/bash

echo "Removing generated files"

rm -f env/config.js
rm -f mobile/app.json
rm -f mobile/ios/CompanionKit/Info.plist
rm -f common/abstractions/services/app.ts

echo "Done."
