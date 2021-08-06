#!/bin/bash

__rm__() {
	read -r -p "Remove $1 ? [Y/n]" confirm
	if [[ ! $confirm =~ ^[Yy] ]]; then
		echo "skipping"
	else
		rm -rf "$1"
	fi
}

__rm__ .nvm
__rm__ node_modules
__rm__ server/functions/node_modules
__rm__ mobile/node_modules
__rm__ dashboard/node_modules
__rm__ mobile/ios/Pods
