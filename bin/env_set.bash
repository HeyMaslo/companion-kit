#!/bin/bash

# Perform substitution operations in the node environment
# local values in the .env file are preferred
_set_ () {
    input=$1;output=$2
    envsub --env-file .env --all "$input" "$output"
}

_set_ env/config-sample.js env/config.js
