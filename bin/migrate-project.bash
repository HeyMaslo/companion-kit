#!/bin/bash

# Helps migrate from an existing companion app setup to a fresh clone.
# Essentially replaces step 2 of the README (Configure Development Environment)
# Provided that the existing project is configured correctly.

# Usage

# bash bin/migrate-project.bash <old_dir> <new_dir>

# OR
# ./bin/migrate-project.bash <old_dir> <new_dir>


old=$1
new=$2

if [[ -z "$old" ]]; then
	echo "must provide path to old project" && exit 1
fi

if [[ -z "$new" ]]; then
	new="."
fi

__check_confirm__() {
	if [[ ! $confirm =~ ^[Yy]$ ]]; then
		echo "exiting" && exit 0
	fi
} 

__fail__() {
	echo "migration failed. There may be leftover files" && exit 1 
}

read -r -p "Will copy files from $old to $new - Continue? (You will be able to choose files to copy) [Y/n] " confirm
__check_confirm__

__copy__() {
	read -r -p "Copy $1 ? [Y/n]" confirm
	if [[ ! $confirm =~ ^[Yy] ]]; then
		echo "skipping"
	else
		cp "$old/$1" "$new/$1" || __fail__
	fi
}

__copy__ "mobile/configs/app/google-services.json"
__copy__ "mobile/configs/app/GoogleService-Info.plist"
__copy__ "mobile/android/app/google-services.json"
__copy__ ".env"
__copy__ "server/functions/.env"

echo "done copying."

read -r -p "Run setup? [Y/n] " confirm
__check_confirm__

cd "$new" && bash bin/setup.bash
