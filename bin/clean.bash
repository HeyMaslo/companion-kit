#!/bin/bash

yes=0

while getopts ":y" opt; do
  case ${opt} in
    y ) yes=1
      ;;
    \? ) echo "Usage: clean [-y]"
      ;;
  esac
done

__rm__() {
	if [ $yes == 1 ]; then
		confirm=y
    else
	    read -r -p "Remove $1 ? [Y/n]" confirm
	fi
	if [[ ! $confirm =~ ^[Yy] ]]; then
		echo "skipping"
	else
		rm -rf "$1"
	fi
}

__rm__ .nvm
__rm__ mobile/dependencies
__rm__ node_modules
__rm__ server/functions/node_modules
__rm__ mobile/node_modules
__rm__ dashboard/node_modules
__rm__ mobile/ios/Pods
