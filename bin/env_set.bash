#!/bin/bash

# Perform substitution operations in the node environment
# local values in the .env file are preferred
_set_ () {
    input=$1;output=$2
    envsub --env-file .env --all "$input" "$output"
}

echo "Setting values"

_set_ env/config-template.js                        env/config.js
_set_ mobile/app-template.json                      mobile/app.json
_set_ mobile/ios/CompanionKit/Info-template.plist   mobile/ios/CompanionKit/Info.plist

echo "Done."
